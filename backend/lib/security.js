const hiddenColumnPattern = /(password|secret|token|resume[_-]?text|private[_-]?key|api[_-]?key|credential|salt|oauth|nonce|verifier|state(?:[_-]?hash)?|code[_-]?hash)/i;

function isHiddenAdminColumn(columnName) {
  return typeof columnName === "string" && hiddenColumnPattern.test(columnName);
}

module.exports = { hiddenColumnPattern, isHiddenAdminColumn };
