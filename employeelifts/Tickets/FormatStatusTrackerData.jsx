// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const FormatStatusTrackerData = ({ trackingData }) => {
//   let parsed = [];
//   try {
//     parsed =
//       typeof trackingData === 'string'
//         ? JSON.parse(trackingData)
//         : trackingData;
//   } catch (e) {
//     parsed = [];
//   }

//   return (
//     <View style={styles.container}>
//       {parsed.map((item, index) => (
//         <View key={index} style={styles.entry}>
//           <Text style={styles.message}>{item.message}</Text>

//           <Text style={styles.timestamp}>
//             {new Date(item.timestamp).toLocaleString()}
//           </Text>
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 30,

//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,

//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   entry: {
//     marginBottom: 12,

//     paddingBottom: 6,
//   },
//   line: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 4,
//   },

//   message: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'black',
//     flexShrink: 1,
//   },
//   timestamp: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#888',
//     marginTop: 2,
//   },
// });

// export default FormatStatusTrackerData;
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FormatStatusTrackerData = ({ trackingData }) => {
  let parsed = [];
  try {
    parsed =
      typeof trackingData === 'string'
        ? JSON.parse(trackingData)
        : trackingData;
  } catch (e) {
    parsed = [];
  }

  return (
    <View style={styles.container}>
      {parsed.map((item, index) => (
        <View key={index} style={styles.entry}>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>{'\u2022'}</Text>
            <View style={styles.messageBlock}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,

    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,

    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  entry: {
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    lineHeight: 22,
    color: '#3EB489',
    marginRight: 15,
  },
  messageBlock: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  timestamp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 8,
  },
});

export default FormatStatusTrackerData;
