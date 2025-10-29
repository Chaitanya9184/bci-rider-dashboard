// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import { MessageSquareIcon } from './Icons';

const FeedbackButton: React.FC = () => {
    const handleFeedbackClick = () => {
        const feedback = window.prompt("We'd love to hear your feedback:");

        if (feedback && feedback.trim() !== '') {
            const phoneNumber = '7875269281'; // The target phone number
            const message = `BCI Rider App Feedback: ${feedback}`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // Open the WhatsApp link in a new tab
            window.open(whatsappUrl, '_blank');

            alert("Thank you for your feedback! You will be redirected to WhatsApp to share it.");
        } else if (feedback !== null) {
            alert("Feedback cannot be empty.");
        }
    };

    return (
        <button
            onClick={handleFeedbackClick}
            title="Share Feedback"
            className="fixed bottom-6 right-6 bg-[var(--primary-color)] text-gray-900 w-16 h-16 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center z-20 focus:outline-none focus:ring-4 focus:ring-[var(--primary-color)]/50"
            aria-label="Share Feedback"
        >
            <MessageSquareIcon className="w-8 h-8" />
        </button>
    );
};

export default FeedbackButton;