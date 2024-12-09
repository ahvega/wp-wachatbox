(function($) {
    'use strict';

    $(document).ready(function() {
        const chatbox = $('#wp-whatsapp-chatbox');
        const chatboxPopup = $('.wp-whatsapp-chatbox-popup');
        const chatboxButton = $('.wp-whatsapp-chatbox-button');
        const chatboxClose = $('.wp-whatsapp-chatbox-close');
        const chatboxForm = $('.wp-whatsapp-chatbox-input-form');
        let isVisible = false;

        // Toggle chat visibility
        function toggleChat(show) {
            isVisible = show;
            chatboxPopup.attr('aria-hidden', !show);

            if (show) {
                chatboxPopup.css('display', 'block');
                // Use setTimeout to ensure the display: block takes effect before animation
                setTimeout(() => {
                    chatboxPopup.css({
                        'opacity': '1',
                        'transform': 'translateY(0) scale(1)'
                    });
                }, 10);
            } else {
                chatboxPopup.css({
                    'opacity': '0',
                    'transform': 'translateY(20px) scale(0.9)'
                });
                // Wait for transition to complete before hiding
                setTimeout(() => {
                    chatboxPopup.css('display', 'none');
                }, 300);
            }
        }

        // Button click handler
        chatboxButton.on('click', function(e) {
            e.preventDefault();
            toggleChat(!isVisible);
        });

        // Close button handler
        chatboxClose.on('click', function(e) {
            e.preventDefault();
            toggleChat(false);
        });

        // Form submit handler
        chatboxForm.on('submit', function(e) {
            e.preventDefault();
            const input = $(this).find('.wp-whatsapp-chatbox-input');
            const message = input.val().trim();

            if (message) {
                const whatsappNumber = wpWhatsAppChatbox.whatsappNumber;
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                input.val('');
                toggleChat(false);
            }
        });

        // Click outside to close
        $(document).on('click', function(e) {
            if (isVisible && !$(e.target).closest('.wp-whatsapp-chatbox').length) {
                toggleChat(false);
            }
        });

        // Auto-show when reaching footer
        if (wpWhatsAppChatbox.autoShowEnabled) {
            let hasShown = false;
            const footer = $('footer, .footer, #footer').first();

            $(window).on('scroll', function() {
                if (!hasShown && footer.length) {
                    const footerTop = footer.offset().top;
                    const scrollPosition = $(window).scrollTop() + $(window).height();

                    if (scrollPosition >= footerTop) {
                        hasShown = true;
                        toggleChat(true);
                    }
                }
            });
        }

        // Handle escape key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && isVisible) {
                toggleChat(false);
            }
        });

        function isWithinBusinessHours() {
            if (!wpWhatsAppChatbox.businessHoursEnabled) {
                return true;
            }

            const now = new Date();
            const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const businessHours = wpWhatsAppChatbox.businessHours[currentDay];

            if (!businessHours || !businessHours.enabled) {
                return false;
            }

            const [startHour, startMinute] = businessHours.start.split(':').map(Number);
            const [endHour, endMinute] = businessHours.end.split(':').map(Number);

            const startTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;

            return currentTime >= startTime && currentTime <= endTime;
        }

        function updateWidgetVisibility() {
            const shouldShow = isWithinBusinessHours();
            chatbox.toggle(shouldShow);
        }

        // Initial check
        updateWidgetVisibility();

        // Check every minute
        setInterval(updateWidgetVisibility, 60000);
    });

})(jQuery);