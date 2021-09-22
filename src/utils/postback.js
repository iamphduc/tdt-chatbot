function createQuickReplies(replies) {
  return replies.map((ele) => ({
    content_type: 'text',
    title: ele,
    payload: '<POSTBACK_PAYLOAD>',
  }));
}

function createScoreListElements(options) {
  const elements = [];
  for (let i = 0; i < options.length; i += 3) {
    elements.push({
      title: 'Chọn học kỳ mà bạn muốn xem điểm!',
      buttons: createScoreListButtons(options.slice(i, i + 3)),
    });
  }

  return elements;
}

function createScoreListButtons(buttons) {
  return buttons.map((ele) => ({
    type: 'postback',
    title: ele.TenHocKy,
    payload: `score -${ele.NameTable}`,
  }));
}

module.exports = {
  createQuickReplies,
  createScoreListElements,
};
