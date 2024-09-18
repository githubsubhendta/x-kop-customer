import React from 'react';
import {Modal, StyleSheet, Text, Pressable, View} from 'react-native';

const LogoutModal = ({modalVisible, setModalVisible, onLogout}) => {
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text className="text-[#862A0D]" style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text className="text-[#862A0D] font-bold text-center">Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonLogout]}
                onPress={onLogout}>
                <Text style={styles.textStyle}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '45%',
  },
  buttonClose: {
    backgroundColor: '#f1f5f9'
  },
  buttonLogout: {
    backgroundColor: '#862A0D',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LogoutModal;
