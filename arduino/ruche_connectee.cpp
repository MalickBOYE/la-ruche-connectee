#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// --- PARAMÈTRES UTILISATEUR ---
const char* ssid = "VOTRE_WIFI_SSID";
const char* password = "VOTRE_WIFI_PASSWORD";
const char* apiEndpoint = "https://votre-backend.railway.app/api/data"; // URL de votre hébergement
const String hiveId = "hive_xf92_jardin";

// Seuils pour alerte locale (LED rouge par exemple)
const float TEMP_MAX = 38.0;

void setup() {
  Serial.begin(115200);
  
  // Connexion WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connexion au WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnecté !");
}

void loop() {
  // 1. Lire les capteurs (Exemple fictif, remplacer par dht.readTemperature())
  float temp = random(300, 350) / 10.0; 
  float hum = random(500, 700) / 10.0;
  float weight = 45.3;
  int battery = 87;

  // 2. Vérification locale des alertes
  if(temp > TEMP_MAX) {
    // Code pour allumer une LED rouge sur la ruche si besoin
  }

  // 3. Envoi des données si WiFi OK
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure *client = new WiFiClientSecure;
    client->setInsecure(); // Pour simplifier le HTTPS en dev (en prod, utiliser un certificat root)
    
    HTTPClient http;
    http.begin(*client, apiEndpoint);
    http.addHeader("Content-Type", "application/json");

    // Création du JSON
    String jsonPayload = "{";
    jsonPayload += "\"id\":\"" + hiveId + "\",";
    jsonPayload += "\"temp\":" + String(temp) + ",";
    jsonPayload += "\"hum\":" + String(hum) + ",";
    jsonPayload += "\"weight\":" + String(weight) + ",";
    jsonPayload += "\"battery\":" + String(battery);
    jsonPayload += "}";

    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("Réponse Serveur: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Erreur Envoi: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
    delete client;
  }
  
  // Attendre 10 minutes avant le prochain envoi pour économiser la batterie
  delay(600000); 
}