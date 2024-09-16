import React from "react";
import {
	SafeAreaView,
	View,
	Text,
	Image,
	TouchableOpacity,
	StatusBar,
	StyleSheet,
	Dimensions,
} from "react-native";
import {
	Ionicons,
	FontAwesome,
	MaterialCommunityIcons,
	MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const LandingPage = () => {
	const navigation = useNavigation();
	const { height, width } = Dimensions.get("window");

	const responsiveFontSize = (size) => (size / 375) * width;
	const responsiveHeight = (size) => (size / 812) * height;

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />

			<Text
				style={[
					styles.title,
					{
						fontSize: responsiveFontSize(24),
						marginTop: responsiveHeight(100),
					},
				]}>
				Voice<Text style={styles.titleHighlight}>2</Text>Sign
			</Text>
			<Text
				style={[
					styles.slogan,
					{
						fontSize: responsiveFontSize(16),
						marginBottom: responsiveHeight(25),
					},
				]}>
				Breaking Barriers, Building Bridges
			</Text>

			<Image
				source={require("./assets/Voice2Sign-logo.png")}
				style={[
					styles.logo,
					{
						width: "88%",
						height: responsiveHeight(260),
						marginBottom: responsiveHeight(20),
					},
				]}
			/>

			<View
				style={[
					styles.rectangle,
					{ width: "88%", marginTop: responsiveHeight(26) },
				]}>
				<View style={styles.firstLine}>
					<TouchableOpacity
						onPress={() => navigation.navigate("VoiceToSignScreen")}
						accessibilityLabel='Voice to Sign'>
						<Text
							style={[styles.starttext, { fontSize: responsiveFontSize(16) }]}>
							Voice to sign
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => navigation.navigate("VoiceToSignScreen")}
						accessibilityLabel='Voice to Sign Icon'>
						<MaterialIcons
							name='multitrack-audio'
							size={responsiveFontSize(24)}
							color='white'
						/>
					</TouchableOpacity>
				</View>
				<View style={styles.secondLine}>
					<TouchableOpacity>
						<Text
							style={[styles.signtext, { fontSize: responsiveFontSize(16) }]}>
							Sign to voice/text
						</Text>
					</TouchableOpacity>
					<TouchableOpacity>
						<FontAwesome
							name='american-sign-language-interpreting'
							size={responsiveFontSize(24)}
							color='white'
						/>
					</TouchableOpacity>
				</View>
			</View>

			<TouchableOpacity
				style={[
					styles.welcomeButton,
					{ width: "88%", marginTop: responsiveHeight(49) },
				]}
				onPress={() => navigation.navigate("VoiceToSignScreen")}
				accessibilityLabel='Home Icon'>
				<Text
					style={[
						styles.welcomeButtonText,
						{ fontSize: responsiveFontSize(16) },
					]}>
					Welcome
				</Text>
			</TouchableOpacity>

			<View style={styles.container2}>
				<View
					style={[styles.iconContainer, { marginTop: responsiveHeight(40) }]}>
					<TouchableOpacity onPress={() => console.log("Home Icon Clicked")}>
						<Ionicons
							name='home-outline'
							size={responsiveFontSize(30)}
							color='white'
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => navigation.navigate("AudioRecordingScreen")}
						accessibilityLabel='Home Icon'>
						<MaterialCommunityIcons
							name='circle-outline'
							size={responsiveFontSize(30)}
							color='#008000'
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => navigation.navigate("HistoryScreen")}
						accessibilityLabel='History Icon'>
						<Ionicons
							name='time-outline'
							size={responsiveFontSize(30)}
							color='white'
						/>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000000",
		paddingHorizontal: 20,
		paddingTop: 10,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	title: {
		color: "#ffffff",
		fontWeight: "bold",
		textAlign: "center",
	},
	titleHighlight: {
		color: "#008000",
	},
	slogan: {
		color: "#CCCCCC",
		textAlign: "center",
	},
	logo: {
		borderRadius: 10,
	},
	rectangle: {
		backgroundColor: "#2F4D3F",
		padding: 5,
		borderRadius: 10,
	},
	firstLine: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingRight: 1,
	},
	secondLine: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingRight: 1,
	},
	starttext: {
		color: "white",
		backgroundColor: "#2F4D3F",
		paddingVertical: 14,
		textAlign: "center",
		borderRadius: 10,
	},
	signtext: {
		color: "#D9D9D9",
		backgroundColor: "#2F4D3F",
		paddingVertical: 14,
		textAlign: "center",
	},
	welcomeButton: {
		backgroundColor: "#2F4D3F",
		paddingVertical: 10,
		borderRadius: 10,
	},
	welcomeButtonText: {
		color: "#ffffff",
		fontWeight: "bold",
		textAlign: "center",
	},
	container2: {
		justifyContent: "flex-end",
		alignItems: "center",
		width: "100%",
		paddingBottom: 10,
	},
	iconContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "100%",
	},
});

export default LandingPage;
