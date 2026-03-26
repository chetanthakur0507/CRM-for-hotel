import mongoose from "mongoose";

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

const globalConnection = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

global.mongooseConnection = globalConnection;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }

  if (globalConnection.conn) {
    return globalConnection.conn;
  }

  if (!globalConnection.promise) {
    globalConnection.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB ?? "callina-crm",
      bufferCommands: false,
    });
  }

  globalConnection.conn = await globalConnection.promise;
  return globalConnection.conn;
}
