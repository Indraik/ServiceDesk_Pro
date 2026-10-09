import api from "./api";

export const getTickets = async (params = {}) => {
    const response = await api.get("/tickets", {
        params
    });

    return response.data;
};

export const getTicketById = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);

    return response.data;
};

export const createTicket = async (ticketData) => {
    const response = await api.post("/tickets", ticketData);

    return response.data;
};
export const getTicketActivity = async (ticketId) => {
    const response = await api.get(
        `/tickets/${ticketId}/activity`
    );

    return response.data;
};

export const getTicketComments = async (ticketId) => {
    const response = await api.get(
        `/tickets/${ticketId}/comments`
    );

    return response.data;
};

export const addTicketComment = async (ticketId, content) => {
    const response = await api.post(
        `/tickets/${ticketId}/comments`,
        { content }
    );

    return response.data;
};


export const updateTicketStatus = async (ticketId, status) => {
    const response = await api.put(
        `/tickets/${ticketId}/status`,
        { status }
    );

    return response.data;
};
