import React, { useState } from "react";
import styled, { css } from "styled-components";
import Input from "Components/common/Input";
import Button from "Components/common/Button";
import Radio from "Components/common/Radio";
import Modal from "Components/common/Modal/Modal";
import AddressModal from "Components/common/Modal/AddressModal";
import SignupModal from "Components/common/Modal/SignupModal";
import CreditModal from "Components/common/Modal/CreditModal";
import {
  isEmail,
  isPassword,
  isName,
  isDateOfBirth,
  isCreditNum,
  isEng,
  isPwNum,
  isSpe,
} from "Utils/validator.js";
import { hashSync } from "Utils/bcrypt";
import { AUTH_LEVEL, USER_STORAGE } from "Utils/constants";
import { loadLocalStorage, saveLocalStorage, autoIncrementUserId } from "Utils/Storage";
import { ReactComponent as Mail } from "Assets/svg/mail.svg";
import { ReactComponent as ClosedEye } from "Assets/svg/eye_closed.svg";
import { ReactComponent as OpenedEye } from "Assets/svg/eye_opened.svg";
import { ReactComponent as Person } from "Assets/svg/person.svg";
import { ReactComponent as Map } from "Assets/svg/map.svg";
import { ReactComponent as Card } from "Assets/svg/card.svg";
import { ReactComponent as Calendar } from "Assets/svg/calendar.svg";
import checkIcon from "Assets/svg/check.svg";

const SignUp = () => {
  const [modalType, setModalType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [emailDuplicateStatus, setEmailDuplicateStatus] = useState(SIGNUP_EMAIL_STATUS.default);
  const [emailDuplicateChecked, setEmailDuplicateChecked] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(true);
  const [passwordCheckError, setPasswordCheckError] = useState(false);
  const [passwordError, setPasswordError] = useState({
    pwNum: false,
    eng: false,
    spe: false,
    digit: false,
  });
  const [formData, setFormData] = useState({
    authority: AUTH_LEVEL.unknown,
    email: "",
    pw: "",
    pwCheck: "",
    name: "",
    address: "",
    detailAddress: "",
    creditCardNum: "",
    dateOfBirth: "",
  });

  const initialState = {
    authority: false,
    email: false,
    pw: false,
    pwCheck: false,
    name: false,
    address: false,
    detailAddress: false,
    creditCardNum: false,
    dateOfBirth: false,
  };
  const [errors, setErrors] = useState(initialState);

  const validator = {
    authority: (authority) => !(authority === AUTH_LEVEL.unknown),
    email: (email) => isEmail(email),
    pw: (pw) => isPassword(pw),
    pwCheck: (pwCheck) => pwCheck === formData.pw,
    name: (name) => isName(name),
    address: (address) => !(address === ""),
    detailAddress: (detailAddress) => !(detailAddress === ""),
    dateOfBirth: (dateOfBirth) => isDateOfBirth(dateOfBirth),
    creditCardNum: (creditCardNum) => isCreditNum(creditCardNum),
  };

  const isAllValid = (data) => {
    for (const name in data) {
      const value = data[name];
      const validateFunction = validator[name];

      if (!validateFunction(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: true,
        }));
        return false;
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: false,
        }));
      }
    }
    return true;
  };

  const handleClickDuplicateCheck = () => {
    setEmailDuplicateChecked(true);

    if (!isEmail(formData.email)) {
      setErrors({ ...errors, email: true });
      setEmailDuplicateStatus(SIGNUP_EMAIL_STATUS.invalidType);
      return;
    }

    const userData = loadLocalStorage(USER_STORAGE);
    if (!userData) {
      setErrors({ ...errors, email: false });
      setEmailDuplicateStatus(SIGNUP_EMAIL_STATUS.confirmedSuccess);
      return;
    }

    const searchEmail = userData.filter((user) => user.email === formData.email);
    if (searchEmail.length) {
      setErrors({ ...errors, email: true });
      setEmailDuplicateStatus(SIGNUP_EMAIL_STATUS.confirmedFailure);
    } else {
      setErrors({ ...errors, email: false });
      setEmailDuplicateStatus(SIGNUP_EMAIL_STATUS.confirmedSuccess);
    }
  };

  const getEmailStatusMessage = (status) => {
    let message = errors.email ? "???????????? ???????????????" : "";
    if (status === SIGNUP_EMAIL_STATUS.invalidType) message = "????????? ????????? ??????????????????";
    else if (status === SIGNUP_EMAIL_STATUS.unConfirmed) message = "?????? ????????? ??????????????????";
    else if (status === SIGNUP_EMAIL_STATUS.confirmedFailure) message = "????????? ????????? ?????????.";
    return message;
  };

  const toggleModal = (modal) => {
    setModalOpen(!modalOpen);
    setModalType(modal);
  };

  const handleSetAuthority = (authority) => {
    setErrors(initialState);
    setFormData({
      ...formData,
      authority,
    });
  };

  const handleSetAddressValue = (address) => {
    setErrors(initialState);
    setFormData({
      ...formData,
      address,
    });
  };

  const handleSetCardNum = (creditCardNum) => {
    setErrors(initialState);
    setFormData({
      ...formData,
      creditCardNum,
    });
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setErrors(initialState);

    if (name === "email") {
      setEmailDuplicateChecked(false);
    }

    if (name === "pw") {
      setPasswordError({
        ...passwordError,
        eng: isEng(value) >= 0,
        pwNum: isPwNum(value) >= 0,
        spe: isSpe(value) >= 0,
        digit: value.length >= 8,
      });
    }

    if (name === "pwCheck") {
      setPasswordCheckError(value !== formData.pw);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();

    if (!emailDuplicateChecked) {
      setErrors((prev) => ({
        ...prev,
        email: true,
      }));
      setEmailDuplicateStatus(SIGNUP_EMAIL_STATUS.unConfirmed);
      return;
    }

    const allValid = isAllValid(formData);
    if (allValid) {
      formData.id = autoIncrementUserId();
      formData.pw = hashSync(formData.pw, 8);
      delete formData.pwCheck;

      const userData = loadLocalStorage(USER_STORAGE);
      userData
        ? saveLocalStorage(USER_STORAGE, [...userData, formData])
        : saveLocalStorage(USER_STORAGE, [formData]);
      toggleModal("success");
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSignupSubmit} passwordError={passwordError}>
        <h4>????????????</h4>

        <Radio
          name="authority"
          value={formData.authority}
          onChange={handleSetAuthority}
          data={[
            { value: AUTH_LEVEL.teacher, label: "?????????" },
            { value: AUTH_LEVEL.parent, label: "?????????" },
          ]}
          error={errors.authority}
          errorMessage="???????????? ?????? ????????? ????????? ?????????."
        />

        <EmailWrapper>
          <Input
            name="email"
            value={formData.email}
            onChange={handleSignUpChange}
            placeholder="???????????? ???????????????"
            icon={<Mail />}
            error={errors.email}
            errorMessage={getEmailStatusMessage(emailDuplicateStatus)}
            successMessage={emailDuplicateChecked && "?????? ????????? ????????? ?????????"}
            width="75%"
          />
          <Button value="????????????" width="20%" onClick={handleClickDuplicateCheck} />
        </EmailWrapper>

        <Input
          name="pw"
          value={formData.pw}
          onChange={handleSignUpChange}
          placeholder="??????????????? ???????????????"
          type={visiblePassword ? "password" : "text"}
          icon={
            visiblePassword ? (
              <ClosedEye onClick={() => setVisiblePassword(!visiblePassword)} />
            ) : (
              <OpenedEye onClick={() => setVisiblePassword(!visiblePassword)} />
            )
          }
          error={errors.pw}
          errorMessage="??????????????? ?????? ????????? ?????????"
        />

        <PasswordPolicy passwordError={passwordError}>
          <div>
            <span className="password-pwNum">??????</span>
          </div>
          <div>
            <span className="password-spe">????????????</span>
          </div>
          <div>
            <span className="password-eng">??????</span>
          </div>
          <div>
            <span className="password-digit">8?????? ??????</span>
          </div>
        </PasswordPolicy>

        <Input
          name="pwCheck"
          value={formData.pwCheck}
          onChange={handleSignUpChange}
          placeholder="??????????????? ?????? ???????????????"
          type={visiblePassword ? "password" : "text"}
          icon={
            visiblePassword ? (
              <ClosedEye onClick={() => setVisiblePassword(!visiblePassword)} />
            ) : (
              <OpenedEye onClick={() => setVisiblePassword(!visiblePassword)} />
            )
          }
          error={passwordCheckError}
          errorMessage="??????????????? ?????? ????????? ?????????"
        />

        <Input
          name="name"
          value={formData.name}
          onChange={handleSignUpChange}
          placeholder="????????? ???????????????"
          icon={<Person />}
          error={errors.name}
          errorMessage="????????? ?????? ????????? ?????????"
        />

        <AddressWrapper>
          <div className="address-main" onClick={() => toggleModal("address")}>
            <Input
              name="address"
              value={formData.address}
              placeholder="????????? ???????????????"
              icon={<Map />}
              error={errors.address}
              errorMessage="????????? ?????? ????????? ?????????"
            />
            <span>????????????</span>
          </div>
          {formData.address && (
            <Input
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleSignUpChange}
              placeholder="??????????????? ???????????????"
              icon={<Map />}
              error={errors.detailAddress}
              errorMessage="??????????????? ?????? ????????? ?????????"
            />
          )}
        </AddressWrapper>

        <CreditCardWrapper onClick={() => toggleModal("credit")}>
          <Input
            name="creditCardNum"
            value={formData.creditCardNum}
            placeholder="???????????? ????????? ???????????????"
            icon={<Card />}
            error={errors.creditCardNum}
            errorMessage="??????????????? ?????? ????????? ?????????"
          />
          <span>????????????</span>
        </CreditCardWrapper>

        <Input
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleSignUpChange}
          placeholder="???????????? 6????????? ???????????????"
          icon={<Calendar />}
          error={errors.dateOfBirth}
          maxLength={6}
          errorMessage="??????????????? ?????? ????????? ?????????"
        />

        <Button type="submit" value="????????????" marginTop="10px" />

        <Modal isOpen={modalOpen} toggleModal={toggleModal} modalType={modalType}>
          <>
            {modalType === "success" && <SignupModal />}
            {modalType === "address" && (
              <AddressModal toggleModal={toggleModal} onSelected={handleSetAddressValue} />
            )}
            {modalType === "credit" && (
              <CreditModal
                creditCard={formData.creditCardNum}
                handleSetCardNum={handleSetCardNum}
                toggleModal={toggleModal}
              />
            )}
          </>
        </Modal>
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  ${({ theme }) => theme.flexSet("center", "center", "column")};
  width: 100%;
  height: calc(100% - 72px);
`;

const Form = styled.form`
  width: 600px;
  padding: 40px;
  border: 1px solid ${({ theme }) => theme.color.borderline};

  h4 {
    font-size: 30px;
    margin-bottom: 20px;
    font-weight: 500;
    text-align: center;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 40px 0;
  }
`;

const EmailWrapper = styled.div`
  ${({ theme }) => theme.flexSet("space-between")};
`;

const PasswordPolicy = styled.div`
  ${({ theme }) => theme.flexSet("space-around")};

  > div {
    span {
      color: ${({ theme }) => theme.color.borderline};
      text-align: center;
      font-size: 15px;
    }
    &::before {
      display: inline-block;
      background: url(${checkIcon});
      content: "";
      width: 20px;
      height: 16px;
    }
    .password-pwNum {
      ${(props) =>
        props.passwordError.pwNum &&
        css`
          color: ${({ theme }) => theme.color.green};
          font-weight: 600;
        `};
    }
    .password-eng {
      ${(props) =>
        props.passwordError.eng &&
        css`
          color: ${({ theme }) => theme.color.green};
          font-weight: 600;
        `};
    }
    .password-spe {
      ${(props) =>
        props.passwordError.spe &&
        css`
          color: ${({ theme }) => theme.color.green};
          font-weight: 600;
        `};
    }
    .password-digit {
      ${(props) =>
        props.passwordError.digit &&
        css`
          color: ${({ theme }) => theme.color.green};
          font-weight: 600;
        `};
    }
  }
`;

const AddressWrapper = styled.div`
  position: relative;

  span {
    position: absolute;
    top: 12.5px;
    right: 2px;
    color: ${({ theme }) => theme.color.green};
    font-size: 13px;
    font-weight: 600;
    padding: 10px 50px 13px 0;
    cursor: pointer;
    background-color: white;
  }
  svg {
    z-index: 1;
  }
`;

const CreditCardWrapper = styled.div`
  position: relative;

  span {
    position: absolute;
    top: 12.5px;
    right: 2px;
    color: ${({ theme }) => theme.color.green};
    font-size: 13px;
    font-weight: 600;
    padding: 10px 50px 13px 0;
    cursor: pointer;
    background-color: white;
  }
  svg {
    z-index: 1;
  }
`;

const SIGNUP_EMAIL_STATUS = {
  default: 0,
  invalidType: 1,
  unConfirmed: 2,
  confirmedFailure: 3,
  confirmedSuccess: 4,
};

export default SignUp;
