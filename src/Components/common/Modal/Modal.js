import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import ModalPortal from "./ModalPortal";
import ModalContents from "./ModalContents";

const Modal = (props) => {
  const { isOpen, toggleModal, modalType } = props;
  console.log(modalType);

  return (
    <>
      {isOpen ? (
        <ModalPortal>
          <Wrapper>
            <ModalContents modalType={modalType} toggleModal={toggleModal} />
          </Wrapper>
        </ModalPortal>
      ) : null}
    </>
  );
};

const Wrapper = styled.div`
  position: absolute;
  width: 500px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: rgba(0, 0, 0, 0.08) 0 4px 2px -2px;
  border-radius: 10px;

  background-color: ${({ theme }) => theme.color.background};
`;

export default Modal;
