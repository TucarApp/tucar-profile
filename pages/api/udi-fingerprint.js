// Mock response for UDI fingerprint
export default function handler(req, res) {
    res.status(200).json({
      success: true,
      message: 'UDI fingerprint updated'
    });
  }
  