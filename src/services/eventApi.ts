import api from "./axios";

export interface EventPayload {
  title: string;
  description: string;
  eventImage: string;
  announcedBy: string;   // User _id
  eventDate: string | Date;
  location: string;
  status?: string;
  isPublished?: boolean;
  startTime?: string;
  endTime?: string;
  venue?: string;
  mapsLocation?: string;
  organizer?: string;
  registrationDeadline?: string | Date | null;
  maxParticipants?: number;
  category?: string;
}

// GET /api/event   — public
export const getPublicEvents = async () => {
  const { data } = await api.get("/event");
  return data; // { success, total, events }
};

// GET /api/event/admin/all — admin/executive only
export const getAllEvents = async () => {
  const { data } = await api.get("/event/admin/all");
  return data; // { success, total, events }
};

// GET /api/event/:id
export const getSingleEvent = async (id: string) => {
  const { data } = await api.get(`/event/${id}`);
  return data;
};

// POST /api/event   — admin only
export const createEvent = async (payload: EventPayload) => {
  const { data } = await api.post("/event", payload);
  return data;
};

// PUT /api/event/:id   — admin only
export const updateEvent = async (id: string, payload: Partial<EventPayload>) => {
  const { data } = await api.put(`/event/${id}`, payload);
  return data;
};

// DELETE /api/event/:id   — admin only
export const deleteEvent = async (id: string) => {
  const { data } = await api.delete(`/event/${id}`);
  return data;
};

// PATCH /api/event/:id/publish
export const publishEvent = async (id: string) => {
  const { data } = await api.patch(`/event/${id}/publish`);
  return data;
};

// PATCH /api/event/:id/unpublish
export const unpublishEvent = async (id: string) => {
  const { data } = await api.patch(`/event/${id}/unpublish`);
  return data;
};
