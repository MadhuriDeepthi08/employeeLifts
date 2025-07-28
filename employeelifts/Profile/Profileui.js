import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Top Orange Cover */}
      <View style={styles.topOrange} />

      {/* Center Circle Image Overlapping Orange */}
      <View style={styles.circleWrapper}>
        <View style={styles.circle}>
          <View style={styles.circleHalf}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }} // Replace with actual image
              style={styles.image}
            />
          </View>
          <View style={styles.circleHalf}>
            <Text style={styles.halfText}>Static Matter</Text>
          </View>
        </View>
      </View>

      {/* Content Below Circle */}
      <View style={styles.content}>
        <Text style={styles.description}>
          This is some description below the image.
        </Text>

        <Text style={styles.heading}>Public Skills</Text>
        <Text style={styles.point}>• Communication</Text>
        <Text style={styles.point}>• Leadership</Text>
        <Text style={styles.point}>• Time Management</Text>
        <Text style={styles.point}>• Adaptability</Text>

        <Text style={styles.heading}>Political Skills</Text>
        <Text style={styles.point}>• Negotiation</Text>
        <Text style={styles.point}>• Diplomacy</Text>
        <Text style={styles.point}>• Strategic Thinking</Text>
        <Text style={styles.point}>• Influence</Text>

        {/* Two Rows of Two Images */}
        <View style={styles.imageRow}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
          />
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
          />
        </View>
        <View style={styles.imageRow}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
          />
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const CIRCLE_SIZE = 150;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topOrange: {
    height: height * 0.2,
    backgroundColor: 'orange',
  },
  circleWrapper: {
    position: 'absolute',
    top: height * 0.2 - CIRCLE_SIZE / 2,
    left: width / 2 - CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2',
  },
  circleHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    marginTop: CIRCLE_SIZE / 2 + 20,
    padding: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  point: {
    fontSize: 16,
    marginBottom: 5,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  gridImage: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 8,
  },
});

export default Profile;
