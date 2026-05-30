const PRIORITIES = ['low', 'medium', 'high'];

const ticketFields = {
  title: { type: 'string', required: true },
  body: { type: 'string', required: true },
  priority: { type: 'string', required: true, enum: PRIORITIES },
  user_email: { type: 'string', required: true },
};

const dbConfig = {
  name: 'help-desk',
  collections: {
    tickets: 'tickets',
  },
};

function validateTicket(data) {
  const errors = [];

  for (const [field, rules] of Object.entries(ticketFields)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

function buildTicketDocument(data) {
  return {
    title: data.title,
    body: data.body,
    priority: data.priority,
    user_email: data.user_email,
  };
}

module.exports = {
  PRIORITIES,
  ticketFields,
  dbConfig,
  validateTicket,
  buildTicketDocument,
};
