// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const FormatStatusTrackerData = ({ trackingData }) => {
//   let parsed = [];
//   try {
//     parsed = JSON.parse(trackingData);
//   } catch (e) {
//     parsed = [];
//   }

//   return (
//     <View style={styles.trackerContainer}>
//       {parsed.map((item, index) => (
//         <View key={index} style={styles.itemBox}>
//           <Text style={styles.status}>{item.status}</Text>
//           <Text style={styles.message}>{item.message}</Text>
//           <Text style={styles.meta}>
//             {item.employeeName} ({item.employeePhone}) - by {item.changedBy}
//           </Text>
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   trackerContainer: {
//     padding: 10,
//     backgroundColor: '#E3F2FD',
//     marginBottom: 10,
//     borderRadius: 8,
//   },
//   itemBox: {
//     marginBottom: 10,
//     marginHorizontal: 20,
//   },
//   status: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: 'black',
//     marginBottom: 10,
//   },
//   message: {
//     color: '#222',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   meta: {
//     fontSize: 16,
//     color: '#888',
//     fontWeight: 'bold',
//   },
// });

// export default FormatStatusTrackerData;
// ✅ FormatStatusTrackerData.js
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
          <Text style={styles.line}>
            {/* <Text style={styles.bullet}>• </Text> */}
            <Text style={styles.message}>{item.message}</Text>
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 10,
    backgroundColor: '#fdfdfd',
    padding: 14,
    borderRadius: 10,
    elevation: 2,
  },
  entry: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 16,
    color: '#000',
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
    marginTop: 2,
  },
});

export default FormatStatusTrackerData;
