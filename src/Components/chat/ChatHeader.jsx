import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SVG_arrow_back} from '../../utils/SVGImage';

const ChatHeader = ({
  officer,
  chats,
  selectedMessages,
  filterMessageType,
  handleEditMessage,
  deleteMessages,
  showEditButton,
  setOpenMenu,
  openMenu,
  navigation,
}) => {
  return (
    <View >
      <TouchableOpacity style={styles.header} onPress={{}}>
      <View className="flex flex-row space-x-3 justify-center items-center">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <SvgXml xml={SVG_arrow_back} height="100%" width="100%" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: officer?.avatar || 'default_avatar_url', 
              }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text
              style={styles.userName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {officer?.name || 'Officer'}
            </Text>
            <Text style={styles.userPosition}>
              {chats?.participants?.find(user => user.officerDetails)
                ?.officerDetails?.ConsultationTypeID?.ConsultationTypeName ||
                'General Offences'}{' '}
              {/* Fallback for position */}
            </Text>
          </View>
        </View>
      </View>

      {selectedMessages.length > 0 ? (
        <View style={styles.headerButtons}>
          {showEditButton &&
            filterMessageType(selectedMessages[0]) === 'text' && (
              <TouchableOpacity
                onPress={() => handleEditMessage(selectedMessages[0])}>
                <Icon name="edit" size={24} color="blue" />
              </TouchableOpacity>
            )}
          <TouchableOpacity onPress={deleteMessages}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setOpenMenu(!openMenu)}>
          <Icon2
            name="dots-three-vertical"
            color="#000"
            size={20}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      )}

      {openMenu && (
        <View style={styles.menu}>
          <Text style={styles.menuItem}>Menu Item 1</Text>
          <Text style={styles.menuItem}>Menu Item 2</Text>
        </View>
      )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 32,
    height: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    height: 42,
    width: 42,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  avatar: {
    height: '100%',
    width: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    maxWidth: 200,
    flexShrink: 1,
  },
  userPosition: {
    fontSize: 14,
    color: '#555',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    top: 64,
    right: 16,
    zIndex: 99,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    color: '#000',
    paddingVertical: 8,
  },
});

export default ChatHeader;
