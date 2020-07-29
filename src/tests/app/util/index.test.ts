import { expect } from "chai";
import { _validateDate, _validateExist } from "../../../app/util";

describe("_validateExist", () => {
  it("should throw error if key doesn't exist in object passed in", () => {
    let stub = {};
    let key = "info";
    expect(() => _validateExist(stub, key)).to.throw(
      Error,
      `${key} doesn't exist.`
    );
  });
  it("should not throw error if the key exist in the object", () => {
    let stub = {
      key: "something",
    };
    expect(() => _validateExist(stub, "key")).to.not.throw();
  });
});
describe("_validateDate", () => {
  it("should throw error if date is earlier then now", () => {
    let now = new Date();
    let yesterday = new Date(now.setDate(now.getDate() - 1));
    expect(() => _validateDate(yesterday.toString())).to.throw(
      Error,
      "Date of booking should be later than now"
    );
  });
  it("should not throw any error if date is later then now", () => {
    let now = new Date();
    let tomorrow = new Date(now.setDate(now.getDate() + 1));
    expect(() => _validateDate(tomorrow.toString())).not.to.throw();
  });
});
