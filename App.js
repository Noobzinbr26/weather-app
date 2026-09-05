import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const OPENWEATHER_API_KEY = 'SEU_API_KEY_AQUI'; // Substitua pela sua chave

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      // Solicitar permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão de localização foi negada');
        setLoading(false);
        return;
      }

      // Obter localização atual
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      
      setLocation({ latitude, longitude });

      // Buscar dados do tempo
      await fetchWeatherData(latitude, longitude);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
      setLoading(false);
    }
  };

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // Dados do tempo atual
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
      );

      // Previsão de 5 dias
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
      );

      setWeather(currentWeatherResponse.data);
      setForecast(forecastResponse.data.list);
    } catch (error) {
      console.error('Erro ao buscar dados do tempo:', error);
      Alert.alert('Erro', 'Não foi possível buscar os dados do tempo. Verifique sua chave de API.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando dados do tempo...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Não foi possível carregar os dados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.cityName}>{weather.name}, {weather.sys.country}</Text>
        <Text style={styles.temperature}>{Math.round(weather.main.temp)}°C</Text>
        <Text style={styles.description}>{weather.weather[0].main}</Text>
      </View>

      {/* Detalhes do tempo */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Sensação térmica</Text>
          <Text style={styles.detailValue}>{Math.round(weather.main.feels_like)}°C</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Umidade</Text>
          <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Vento</Text>
          <Text style={styles.detailValue}>{Math.round(weather.wind.speed)} m/s</Text>
        </View>
      </View>

      {/* Previsão de 5 dias */}
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>Previsão de 5 Dias</Text>
        {forecast && forecast.slice(0, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
          <View key={index} style={styles.forecastItem}>
            <Text style={styles.forecastDate}>
              {new Date(item.dt * 1000).toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.forecastTemp}>
              {Math.round(item.main.temp)}°C - {item.weather[0].main}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  forecastContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  forecastDate: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  forecastTemp: {
    fontSize: 14,
    color: '#fff',
  },
});
