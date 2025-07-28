import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign'
// Remove import { contactsMenuButtons } from '../constants/temData'

export default function ContactsMenu() {
	return (
		<View style={styles.container}>
			{/* Replace contactsMenuButtons.map with a placeholder for real data */}
			{/* This section is currently empty as the data source is not provided */}
			{/* For demonstration, we'll show a placeholder message */}
			<Text style={styles.placeholderText}>Contacts data is loading or not available.</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	row: {
		alignItems: 'center',
		flexDirection: 'row',
		marginBottom: 18,
	},
	buttonContainer: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	text: {
		fontSize: 15,
		fontWeight: 'bold',
		color: '#ffff',
		marginLeft: 17,
		cursor: 'pointer',
	},
	jobTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: 'grey',
		marginLeft: 17,
	},
	starIcon: {
		backgroundColor: '#3333',
		width: 55,
		height: 55,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		cursor: 'pointer',
	},
	image: {
		borderRadius: 26,
		width: 55,
		height: 55,
		cursor: 'pointer',
	},
	placeholderText: {
		fontSize: 16,
		color: '#888',
		textAlign: 'center',
		paddingVertical: 20,
	},
})
