(() => {
  const btnBack = document.getElementById("btn-back");

  btnBack.addEventListener("click", () => {
    window.location.href = "/";
  });
})();

(() => {
  const btnSubmit = document.getElementById("btn-submit");
  const selScore = document.getElementById("sel-score");
  const selTimetable = document.getElementById("sel-timetable");

  btnSubmit.addEventListener("click", () => {
    const data = {
      score: selScore.value,
      timetable: selTimetable.value,
    };
    const currentURL = window.location.href;

    fetch(currentURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success") {
          alert("Setting saved!");
          return;
        }

        alert("Oops! Something went wrong!");
      });
  });
})();
