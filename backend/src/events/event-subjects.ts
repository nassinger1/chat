export const BROADCAST_SUBJECT = "chat.events";

export const userSubject = (userId: string) => `${BROADCAST_SUBJECT}.${userId}`;
