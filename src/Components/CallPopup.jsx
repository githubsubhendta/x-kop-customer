import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Modal from "react-native-modal";
import { SvgXml } from "react-native-svg";
import book from '../images/book2.jpg';
import { SVG_hangout_white, SVG_phone } from "../Utils/SVGImage";
import useUserStore from "../stores/user.store";

const CallPopup = ({ isVisible, onAccept, onReject, userInfo }) => {
  const { user } = useUserStore();

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInDown" 
      animationOut="slideOutUp" 
      backdropOpacity={0.7}
      style={styles.modal} 
      useNativeDriver={true} 
    >
      <View style={styles.popupContainer}>
        <Image
          source={userInfo.current?.avatar ? { uri: userInfo.current?.avatar } : book}
          style={styles.avatar}
        />
        <Text style={styles.name}>{userInfo.current?.name || "Unknown Caller"}</Text>
        <Text style={styles.details}>
          {user?.officerDetails?.ConsultationTypeID?.ConsultationTypeName || "Consultation Type"}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
            <SvgXml xml={SVG_phone} height="40px" width="40px" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onReject} style={styles.rejectButton}>
            <SvgXml xml={SVG_hangout_white} height="40px" width="40px" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start', 
    marginTop: 0, 
  },
  popupContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20, 
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    fontWeight: "400",
    color: "#606060",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 32,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#F44336",
    padding: 16,
    borderRadius: 32,
    alignItems: "center",
  },
});

export default CallPopup;
