import React from 'react';
import {View, FlatList, StyleSheet, ActivityIndicator} from 'react-native';

const ChatArea = ({
  flatListRef,
  allMessages,
  renderMessage,
  onLoadMore, loading,
}) => {
  return (
    <View style={styles.chatArea}>
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={item =>
          item._id || item.id || Math.random().toString()
        }
        renderItem={renderMessage}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        inverted
        ListFooterComponent={loading ? <ActivityIndicator size="small" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    marginBottom: 100,
    paddingBottom: 10,
  },
});

export default ChatArea;
