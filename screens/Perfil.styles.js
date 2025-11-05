import { StyleSheet } from "react-native";

export const estilos = StyleSheet.create({
  container: {
    // flex: 1, // Remover o flex:1 daqui pois já estará na SafeAreaView
    backgroundColor: "#f2f2f2",
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
    borderWidth: 3,
    borderRadius: 75,
    padding: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  userEmail: {
    fontSize: 16,
    color: "#bdc3c7",
    marginRight: 10, // Espaço entre o email e o botão de editar
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  editEmailButton: {
    padding: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#34495e",
  },
  infoInput: {
    flex: 1,
    fontSize: 16,
    color: "#34495e",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingVertical: 5,
  },
  editButton: {
    marginLeft: "auto",
  },
  saveButton: {
    backgroundColor: "#28a745", // Um verde mais vibrante
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // Para alinhar texto e ícone
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  editProfileButton: {
    backgroundColor: "#007bff", // Azul para editar
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  editProfileButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonText: {
    fontSize: 16,
    color: "#34495e",
  },
  logoutButton: {
    backgroundColor: "#c0392b",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    backgroundColor: "#2c3e50",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});