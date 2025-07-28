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
//       {parsed.map((item, index) => {
//         const rawTimestamp =
//           item.timestamp ||
//           item.Date ||
//           item.updatedDate ||
//           item.created_at ||
//           item.updated_at;

//         const timestamp = new Date(rawTimestamp);
//         const isValidDate = !isNaN(timestamp.getTime());

//         return (
//           <View key={index} style={styles.entry}>
//             <View style={styles.bulletRow}>
//               <Text style={styles.bullet}>{'\u2022'}</Text>
//               <View style={styles.messageBlock}>
//                 <Text style={styles.message}>{item.message}</Text>
//                 {item.changedBy && (
//                   <Text style={styles.subText}>
//                     {item.changedBy} {item.employeePhone}
//                   </Text>
//                 )}

//                 {item.statusName === 'Engineer Assigned' &&
//                   console.log(
//                     'Engineer Assigned Data:',
//                     item,
//                   )(item.employeeName || item.employeePhone) && (
//                     <Text style={styles.subText}>
//                       {item.employeeName} {item.employeePhone}
//                     </Text>
//                   )}

//                 {item.arrivalDate && (
//                   <Text style={styles.subText}>
//                     Arrival:{' '}
//                     {new Date(item.arrivalDate).toLocaleString('en-US', {
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                       hour: 'numeric',
//                       minute: '2-digit',
//                       hour12: true,
//                     })}
//                   </Text>
//                 )}

//                 {/* {rawTimestamp && (
//                   <Text style={styles.timestamp}>
//                     {isValidDate
//                       ? `${timestamp.toLocaleString('en-US', {
//                           month: 'short',
//                         })} ${timestamp.getDate()} ${timestamp.getFullYear()} ${timestamp.toLocaleTimeString(
//                           'en-US',
//                           {
//                             hour: 'numeric',
//                             minute: '2-digit',
//                             hour12: true,
//                           },
//                         )}`
//                       : String(rawTimestamp)}
//                   </Text>
//                 )} */}
//                 {item.message !== 'Ticket created' && rawTimestamp && (
//                   <Text style={styles.timestamp}>
//                     {isValidDate
//                       ? `${timestamp.toLocaleString('en-US', {
//                           month: 'short',
//                         })} ${timestamp.getDate()} ${timestamp.getFullYear()} ${timestamp.toLocaleTimeString(
//                           'en-US',
//                           {
//                             hour: 'numeric',
//                             minute: '2-digit',
//                             hour12: true,
//                           },
//                         )}`
//                       : String(rawTimestamp)}
//                   </Text>
//                 )}
//               </View>
//             </View>
//           </View>
//         );
//       })}
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
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   bullet: {
//     fontSize: 20,
//     lineHeight: 22,
//     color: '#3EB489',
//     marginRight: 15,
//   },
//   messageBlock: {
//     flex: 1,
//   },
//   message: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   subText: {
//     fontSize: 14,
//     color: '#888',
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   timestamp: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#888',
//     marginTop: 4,
//   },
// });

// export default FormatStatusTrackerData;
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
