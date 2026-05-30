-- Trigger: insert in-app notifications when booking status changes
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.client_id IS NOT NULL THEN
    INSERT INTO notifications(user_id, type, title, body, link)
    VALUES (NEW.client_id, 'booking_confirmed', 'Booking confirmed',
      'Your booking request has been accepted. Message the provider to arrange details.', '/dashboard');
  END IF;
  IF NEW.status = 'cancelled' AND OLD.status = 'pending' AND NEW.client_id IS NOT NULL THEN
    INSERT INTO notifications(user_id, type, title, body, link)
    VALUES (NEW.client_id, 'booking_declined', 'Booking request declined',
      'Your booking request could not be confirmed. Try another provider or a different date.', '/dashboard');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_status_notification ON bookings;
CREATE TRIGGER booking_status_notification
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_status_change();
