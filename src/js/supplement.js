export class Keyboard {
  constructor() {
    this.list = [];
    window.addEventListener("keydown", this.downHandler, false);
    window.addEventListener("keyup", this.upHandler, false);
  }
  downHandler(ev) {
    this.list
      .filter((el) => el.code === ev.keyCode)
      .forEach((el) => {
        if (!el.isDown) {
          el.isDown = true;
          el.handler(el);
        }
      });
  }
  upHandler(ev) {
    this.list
      .filter((el) => el.code === ev.keyCode)
      .forEach((el) => {
        if (el.isDown) {
          el.isDown = false;
          el.handler(el);
        }
      });
  }
  add(keyCode, handler) {
    const obj = {
      code: keyCode,
      isDown: false,
      handler: handler,
    };
    this.list.push(obj);
    return obj;
  }
  remove(obj) {
    const findIndex = this.list.findIndex((el) => el.code === obj.code && el.handler === obj.handler);
    if (findIndex !== -1) {
      this.list.splice(findIndex, 1);
    }
  }
}
export const keyboard = (keyCode) => {
  const key = {};
  key.code = keyCode;
  key.isDown = false;
  key.press = [];
  key.release = [];

  key.downHandler = (event) => {
    if (event.keyCode === key.code) {
      if (!key.isDown) {
        key.isDown = true;
        if (key.press.length) key.press.forEach((el) => el());
      }
    }
    event.preventDefault();
  };

  key.upHandler = (event) => {
    if (event.keyCode === key.code) {
      if (key.isDown) {
        key.isDown = false;
        if (key.release.length) key.release.forEach((el) => el());
      }
    }
    event.preventDefault();
  };
  key.addPress = (handler) => {
    key.press.push(handler);
  };
  key.addRelease = (handler) => {
    key.release.push(handler);
  };

  window.addEventListener("keydown", key.downHandler.bind(key), false);
  window.addEventListener("keyup", key.upHandler.bind(key), false);
  return key;
};

export const addControl = (key, handler) => {
  key.addPress(() => handler(true));
  key.addRelease(() => handler(false));
  /*key.press.push(() => {
    handler(true);
  });
  key.release.push(() => {
    handler(false);
  });*/
};
