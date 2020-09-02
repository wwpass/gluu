var application = (function (exports) {
  'use strict';

  const userBlock = document.querySelector(`.user`);
  const userPopup = userBlock.querySelector(`.user__popup`);
  const closePopup = userBlock.querySelector(`.user__popup-close`);
  const overlay = document.querySelector(`.overlay`);

  const closePopupOnClick = (evt) => {
    // evt.preventDefault();
    userPopup.style.display = `none`;
    overlay.style.display = `none`;
    setTimeout(() => {
      userBlock.addEventListener(`click`, userOnClick);
    }, 100);
  };

  const userOnClick = () => {
    userPopup.style.display = `flex`;
    overlay.style.display = `block`;
    userBlock.removeEventListener(`click`, userOnClick);
  };

  if (userBlock) {
    userBlock.addEventListener(`click`, userOnClick);
    closePopup.addEventListener(`click`, closePopupOnClick);
    overlay.addEventListener(`click`, closePopupOnClick);
  }

  exports.closePopupOnClick = closePopupOnClick;

  return exports;

}({}));

//# sourceMappingURL=user.js.map
