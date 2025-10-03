-- Update existing Instagram messages with isFromBusiness field
-- Business Account ID: 17841404895525433

-- Update business messages (sent by our business account)
UPDATE InstagramMessage 
SET isFromBusiness = 1 
WHERE senderId = '17841404895525433' AND isFromBusiness IS NULL;

-- Update customer messages (sent by customers)
UPDATE InstagramMessage 
SET isFromBusiness = 0 
WHERE senderId != '17841404895525433' AND isFromBusiness IS NULL;

-- Show summary
SELECT 
  COUNT(*) as total_messages,
  SUM(CASE WHEN isFromBusiness = 1 THEN 1 ELSE 0 END) as business_messages,
  SUM(CASE WHEN isFromBusiness = 0 THEN 1 ELSE 0 END) as customer_messages,
  SUM(CASE WHEN isFromBusiness IS NULL THEN 1 ELSE 0 END) as null_messages
FROM InstagramMessage;
