export function createQuickReplies(replies: any) {
  return replies.map((ele: any) => ({
    content_type: "text",
    title: ele,
    payload: "<POSTBACK_PAYLOAD>",
  }));
}

function createScoreListButtons(buttons: any) {
  return buttons.map((ele: any) => ({
    type: "postback",
    title: ele.TenHocKy,
    payload: `score -${ele.NameTable}`,
  }));
}

export function createScoreListElements(options: any) {
  const elements = [];
  for (let i = 0; i < options.length; i += 3) {
    elements.push({
      title: "Chọn học kỳ mà bạn muốn xem điểm!",
      buttons: createScoreListButtons(options.slice(i, i + 3)),
    });
  }

  return elements;
}
