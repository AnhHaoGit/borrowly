/**
 * Đưa con trỏ vào ô nhập lỗi đầu tiên sau khi bấm gửi form
 * (người dùng bàn phím / trình đọc màn hình biết ngay chỗ cần sửa).
 */
export function focusField(form: HTMLFormElement, fieldName: string) {
  const element = form.elements.namedItem(fieldName);
  if (element instanceof HTMLElement) element.focus();
}
