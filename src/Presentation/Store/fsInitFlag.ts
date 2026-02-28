let fsInitStarted = false;

export const getFsInitStarted = () => fsInitStarted;
export const setFsInitStarted = (value: boolean) => {
  fsInitStarted = value;
};
export const resetFsInitFlag = () => {
  fsInitStarted = false;
};
