import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';

type HealthResponse = {
  message: string;
  status: string;
};

type EnergiaResponse = {
  result: number;
  inputs: {
    E: number;
    A: number;
    theta: number;
  };
};

type MonteCarloResponse = {
  inputs: {
    p: number;
    n0: number;
    pasos: number;
    seed: number | null;
  };
  series: number[];
  summary: {
    final: number;
    max: number;
    min: number;
    length: number;
  };
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const [energiaE, setEnergiaE] = useState('2.5');
  const [energiaA, setEnergiaA] = useState('56');
  const [energiaTheta, setEnergiaTheta] = useState('45');
  const [energiaLoading, setEnergiaLoading] = useState(false);
  const [energiaError, setEnergiaError] = useState<string | null>(null);
  const [energiaData, setEnergiaData] = useState<EnergiaResponse | null>(null);

  const [mcP, setMcP] = useState('0.7');
  const [mcN0, setMcN0] = useState('10');
  const [mcPasos, setMcPasos] = useState('20');
  const [mcSeed, setMcSeed] = useState('42');
  const [mcLoading, setMcLoading] = useState(false);
  const [mcError, setMcError] = useState<string | null>(null);
  const [mcData, setMcData] = useState<MonteCarloResponse | null>(null);

  const apiBaseUrl = useMemo(() => {
    if (Platform.OS === 'android') {
      // Android emulator maps localhost to 10.0.2.2
      return 'http://10.0.2.2:8000';
    }
    return 'http://127.0.0.1:8000';
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/health/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as HealthResponse;
      setHealth(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo conectar al backend: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  const runEnergiaFinal = async () => {
    setEnergiaLoading(true);
    setEnergiaError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/energia-final/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          E: energiaE,
          A: energiaA,
          theta: energiaTheta,
        }),
      });

      const payload = (await response.json()) as EnergiaResponse | { error: string };
      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${response.status}`);
      }
      setEnergiaData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setEnergiaError(message);
    } finally {
      setEnergiaLoading(false);
    }
  };

  const runMonteCarlo = async () => {
    setMcLoading(true);
    setMcError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/monte-carlo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p: mcP,
          n0: mcN0,
          pasos: mcPasos,
          seed: mcSeed,
        }),
      });

      const payload = (await response.json()) as MonteCarloResponse | { error: string };
      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${response.status}`);
      }
      setMcData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setMcError(message);
    } finally {
      setMcLoading(false);
    }
  };

  const monteSeries = mcData?.series ?? [];
  const monteMax = monteSeries.length ? Math.max(...monteSeries) : 1;

  const openFisionSimulation = async () => {
    const fisionUrl = `${apiBaseUrl}/api/fision/`;
    try {
      await Linking.openURL(fisionUrl);
    } catch {
      setError(`No se pudo abrir la simulacion de fision en ${fisionUrl}`);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Tesis App</Text>
          <Text style={styles.subtitle}>Django + React Native (Expo)</Text>
          <Text style={styles.heroCopy}>
            Base inicial para una app Android gratuita con backend en Django API.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Estado del backend</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#0b4f6c" />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <>
              <Text style={styles.success}>{health?.status?.toUpperCase()}</Text>
              <Text style={styles.message}>{health?.message}</Text>
            </>
          )}

          <Pressable style={styles.button} onPress={loadHealth}>
            <Text style={styles.buttonText}>Probar conexion</Text>
          </Pressable>

          <Text style={styles.baseUrl}>API: {apiBaseUrl}/api/health/</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Modulos iniciales</Text>
          <Text style={styles.item}>- Salud del sistema (health check)</Text>
          <Text style={styles.item}>- Calculo de energia final (del notebook)</Text>
          <Text style={styles.item}>- Simulacion Monte Carlo (del notebook)</Text>
          <Text style={styles.item}>- Simulacion de fision visual (interactiva)</Text>

          <Pressable style={styles.buttonSecondary} onPress={openFisionSimulation}>
            <Text style={styles.buttonSecondaryText}>Abrir simulacion de fision</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Energia Final</Text>
          <Text style={styles.label}>E</Text>
          <TextInput style={styles.input} value={energiaE} onChangeText={setEnergiaE} keyboardType="numeric" />
          <Text style={styles.label}>A</Text>
          <TextInput style={styles.input} value={energiaA} onChangeText={setEnergiaA} keyboardType="numeric" />
          <Text style={styles.label}>Theta (grados)</Text>
          <TextInput style={styles.input} value={energiaTheta} onChangeText={setEnergiaTheta} keyboardType="numeric" />

          <Pressable style={styles.button} onPress={runEnergiaFinal}>
            <Text style={styles.buttonText}>Calcular energia final</Text>
          </Pressable>

          {energiaLoading ? <ActivityIndicator size="small" color="#0b4f6c" /> : null}
          {energiaError ? <Text style={styles.error}>{energiaError}</Text> : null}
          {energiaData ? (
            <Text style={styles.message}>Resultado: {energiaData.result.toFixed(6)}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Simulacion Monte Carlo</Text>
          <Text style={styles.label}>p (0 a 1)</Text>
          <TextInput style={styles.input} value={mcP} onChangeText={setMcP} keyboardType="numeric" />
          <Text style={styles.label}>n0</Text>
          <TextInput style={styles.input} value={mcN0} onChangeText={setMcN0} keyboardType="numeric" />
          <Text style={styles.label}>pasos</Text>
          <TextInput style={styles.input} value={mcPasos} onChangeText={setMcPasos} keyboardType="numeric" />
          <Text style={styles.label}>seed (opcional)</Text>
          <TextInput style={styles.input} value={mcSeed} onChangeText={setMcSeed} keyboardType="numeric" />

          <Pressable style={styles.button} onPress={runMonteCarlo}>
            <Text style={styles.buttonText}>Ejecutar Monte Carlo</Text>
          </Pressable>

          {mcLoading ? <ActivityIndicator size="small" color="#0b4f6c" /> : null}
          {mcError ? <Text style={styles.error}>{mcError}</Text> : null}
          {mcData ? (
            <View>
              <Text style={styles.message}>Final: {mcData.summary.final}</Text>
              <Text style={styles.message}>Max: {mcData.summary.max}</Text>
              <Text style={styles.message}>Min: {mcData.summary.min}</Text>
              <Text style={styles.message}>Serie (inicio): {mcData.series.slice(0, 8).join(', ')}</Text>

              <Text style={styles.chartTitle}>Grafica de neutrones por paso</Text>
              <View style={styles.chartWrap}>
                {monteSeries.map((value, index) => {
                  const normalized = monteMax > 0 ? value / monteMax : 0;
                  const barHeight = Math.max(4, normalized * 140);
                  return (
                    <View key={`${index}-${value}`} style={styles.chartBarGroup}>
                      <View style={[styles.chartBar, { height: barHeight }]} />
                      <Text style={styles.chartX}>{index}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Grafica de energia vs angulo</Text>
          <Text style={styles.item}>Se muestra una curva discreta manteniendo E y A actuales.</Text>
          <View style={styles.chartWrap}>
            {[0, 30, 60, 90, 120, 150, 180].map((angle) => {
              const e = Number(energiaE) || 0;
              const a = Number(energiaA) || 1;
              const radians = (angle * Math.PI) / 180;
              const energyAtAngle = e * ((a * a + 1 + 2 * a * Math.cos(radians)) / ((a + 1) ** 2));
              const normalized = e > 0 ? energyAtAngle / e : 0;
              const barHeight = Math.max(4, normalized * 140);

              return (
                <View key={angle} style={styles.chartBarGroup}>
                  <View style={[styles.chartBarAlt, { height: barHeight }]} />
                  <Text style={styles.chartX}>{angle}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f9ff',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    gap: 16,
  },
  hero: {
    width: '100%',
    maxWidth: 560,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0b4f6c',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#315f72',
  },
  heroCopy: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#4d6b7a',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#d8e6ef',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#6d8796',
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b4f6c',
    marginBottom: 8,
  },
  item: {
    fontSize: 14,
    color: '#234d61',
    lineHeight: 23,
  },
  success: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f7a3e',
  },
  message: {
    fontSize: 15,
    color: '#113b4d',
  },
  error: {
    fontSize: 14,
    color: '#b43b3b',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#0b4f6c',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonSecondary: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#0b4f6c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#eaf7ff',
  },
  buttonSecondaryText: {
    color: '#0b4f6c',
    fontWeight: '700',
    fontSize: 14,
  },
  baseUrl: {
    marginTop: 14,
    fontSize: 12,
    color: '#547282',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bfd5e3',
    borderRadius: 8,
    backgroundColor: '#f8fcff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#113b4d',
  },
  chartTitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
    color: '#0b4f6c',
  },
  chartWrap: {
    marginTop: 10,
    minHeight: 170,
    borderWidth: 1,
    borderColor: '#d8e6ef',
    borderRadius: 10,
    backgroundColor: '#f8fcff',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    overflow: 'hidden',
  },
  chartBarGroup: {
    alignItems: 'center',
  },
  chartBar: {
    width: 10,
    backgroundColor: '#0b4f6c',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartBarAlt: {
    width: 14,
    backgroundColor: '#2f8f83',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartX: {
    marginTop: 6,
    fontSize: 10,
    color: '#5b7b8c',
  },
});
