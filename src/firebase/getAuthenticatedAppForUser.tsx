import { FirebaseApp, initializeApp } from "firebase/app";
import { User, getAuth, signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth, firebaseApp, firebaseConfig } from "./firebase";

interface AuthenticatedAppResponse {
  app: FirebaseApp | null;
  currentUser: User | null;
}

export async function getAuthenticatedAppForUser(
  session?: string | null
): Promise<AuthenticatedAppResponse> {
  if (typeof window !== "undefined") {
    console.log("client: ", firebaseApp);
    return {
      app: firebaseApp,
      currentUser: firebaseAuth.currentUser?.toJSON() as User,
    };
  }

  const { initializeApp: initializeAdminApp, getApps: getAdminApps } =
    await import("firebase-admin/app");
  const { getAuth: getAdminAuth } = await import("firebase-admin/auth");
  const { credential } = await import("firebase-admin");

  const ADMIN_APP_NAME = "firebase-frameworks";
  const adminApp =
    getAdminApps().find((it) => it.name === ADMIN_APP_NAME) ||
    initializeAdminApp(
      {
        credential: credential.applicationDefault(),
      },
      ADMIN_APP_NAME
    );

  const adminAuth = getAdminAuth(adminApp);
  const noSessionReturn: AuthenticatedAppResponse = {
    app: null,
    currentUser: null,
  };

  if (!session) {
    session = await getAppRouterSession();
    if (!session) return noSessionReturn;
  }

  const decodedIdToken = await adminAuth.verifySessionCookie(session);
  const app = initializeAuthenticatedApp(decodedIdToken.uid);
  const auth = getAuth(app);

  const isRevoked = !(await adminAuth
    .verifySessionCookie(session, true)
    .catch((e) => console.error(e.message)));
  if (isRevoked) return noSessionReturn;

  if (auth.currentUser?.uid !== decodedIdToken.uid) {
    const customToken = await adminAuth
      .createCustomToken(decodedIdToken.uid)
      .catch((e) => console.error(e.message));

    if (!customToken) return noSessionReturn;
    await signInWithCustomToken(auth, customToken);
  }

  console.log("server: ", app);
  return { app, currentUser: auth.currentUser };
}

async function getAppRouterSession(): Promise<string | undefined> {
  // Dynamically import to prevent import errors in pages router
  const { cookies } = await import("next/headers");

  try {
    return cookies().get("__session")?.value;
  } catch (error) {
    return undefined;
  }
}

function initializeAuthenticatedApp(uid: string): FirebaseApp {
  const random = Math.random().toString(36).split(".")[1];
  const appName = `authenticated-context:${uid}:${random}`;
  const app = initializeApp(firebaseConfig, appName);

  return app;
}
