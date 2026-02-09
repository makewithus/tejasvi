import emailjs from '@emailjs/browser';

// Service ID, Template ID, and Public Key should be in environment variables
// For this generated code, I will use import.meta.env
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'helpers_service';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'helpers_template';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'helpers_key';

interface EmailParams {
    to_name: string;
    to_email: string;
    event_name: string;
    registration_id: string;
    login_email: string;
    login_password: string; // The phone number
    qr_code_url: string;
    qr_code_base64?: string; // Base64 version of the QR for direct embedding
    access_link?: string; // Direct link to user dashboard
}

export const sendConfirmationEmail = async (params: EmailParams) => {
    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
                ...params,
                // Aliases to match most templates
                name: params.to_name,
                email: params.to_email,
                title: params.event_name,
                qr_code: params.qr_code_url,
                dashboard_link: params.access_link,
                message: `Your registration for ${params.event_name} is confirmed. View your pass: ${params.access_link}`,
                time: new Date().toLocaleString(),
            } as unknown as Record<string, unknown>,
            PUBLIC_KEY
        );
        return response;
    } catch (error) {
        console.error('EmailJS Error:', error);
        throw error;
    }
};
