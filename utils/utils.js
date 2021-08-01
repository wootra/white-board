export const pt = (x, y) => ({ x, y });
export const command = (cmd, more = {}) => ({ ...more, cmd });
