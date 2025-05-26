document.addEventListener('DOMContentLoaded', () => {
    // Coordenadas de la ESPE
    const coordenadasESPE = [-0.316607, -78.442051];
    // Inicializa el mapa centrado en ESPE
    const mapa = L.map('mapa').setView(coordenadasESPE, 13);
  
    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Capa WMS del límite del DMQ
    const limiteDMQ = L.tileLayer.wms('https://geomdmq.quito.gob.ec:8443/geoserver/smiq/wms', {
        layers: 'limite_dmq_a',
        format: 'image/png',
        transparent: true,
        attribution: 'MDMQ Geoserver',
    }).addTo(mapa);

    // Círculo para la ESPE con popup informativo
    L.circle(coordenadasESPE, {
        color: "#dc3545",
        fillColor: "#dc3545",
        fillOpacity: 0.7,
        radius: 100
    }).addTo(mapa).bindPopup(
        "<b>Universidad de las Fuerzas Armadas ESPE</b><br>" +
        "PM2.5: 90 µg/m³<br>" +
        "PM10: 115 µg/m³<br>" +
        "<span style='color:#dc3545'>●</span> Calidad del aire mala<br> "+
        "<button onclick=\"seleccionarZona('ESPE')\">Ver gráfico horario</button>"
    );

    // Datos de calidad de aire por zona
    const dataCalidadAire = {
        zonas: [
            { nombre: "Centro Histórico", pm25: 79, pm10: 130 },
            { nombre: "La Marín", pm25: 66, pm10: 115 },
            { nombre: "El Trébol", pm25: 62, pm10: 98 },
            { nombre: "La Ofelia", pm25: 38, pm10: 87 },
            { nombre: "Quitumbe", pm25: 53, pm10: 95 },
            { nombre: "Parque Metropolitano", pm25: 11, pm10: 20 },
            { nombre: "Cumbayá", pm25: 19, pm10: 30 },
            { nombre: "Tumbaco", pm25: 23, pm10: 35 },
            { nombre: "El Condado", pm25: 15, pm10: 25 },
            { nombre: "La Armenia", pm25: 20, pm10: 33 },
            { nombre: "La Carolina", pm25: 50, pm10: 89 },
            { nombre: "Belisario", pm25: 55, pm10: 80 }
        ]
    };

    // Coordenadas de cada zona
    const ubicaciones = {
        "Centro Histórico": [-0.2211, -78.5125],
        "La Marín": [-0.2207, -78.5075],
        "El Trébol": [-0.2330, -78.4996],
        "La Ofelia": [-0.0971, -78.4850],
        "Quitumbe": [-0.3272, -78.5525],
        "Parque Metropolitano": [-0.155, -78.469],
        "Cumbayá": [-0.208, -78.418],
        "Tumbaco": [-0.235, -78.353],
        "El Condado": [-0.045, -78.488],
        "La Armenia": [-0.2705599, -78.4691157343706],
        "La Carolina": [-0.180, -78.480],
        "Belisario": [-0.189187, -78.506330]
    };

    // Horas del día para el gráfico
    const horas = ['07:00', '10:00', '12:00', '14:00', '17:00'];

    // Niveles horarios de PM2.5 por zona
    const nivelesHorarios = {
        "Centro Histórico": [65, 75, 105, 97, 55],
        "La Marín": [45, 55, 92, 89, 50],
        "El Trébol": [60, 72, 84, 55, 38],
        "La Ofelia": [35, 40, 43, 41, 30],
        "Quitumbe": [38, 52, 78, 60, 35],
        "ESPE": [65, 60, 75, 65, 80],
        "Parque Metropolitano": [10, 12, 13, 11, 9],
        "Cumbayá": [18, 20, 21, 19, 17],
        "Tumbaco": [22, 25, 26, 24, 20],
        "El Condado": [14, 16, 17, 15, 13],
        "La Armenia": [20, 22, 23, 21, 18],
        "La Carolina": [85, 78, 80, 70, 90], 
        "Belisario": [50, 55, 60, 58, 52],
    };

    // Inicializa el gráfico de barras vacío
    const ctx = document.getElementById('graficoPM25').getContext('2d');
    let grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: horas,
            datasets: [{
                label: 'PM2.5',
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 150,
                    title: {
                        display: true,
                        text: 'µg/m³'
                    }
                }
            }
        }
    });

    // Genera recomendaciones según los niveles horarios de PM2.5
    const generarRecomendaciones = (zonaNombre) => {
        const ul = document.getElementById("listaRecomendaciones");
        ul.innerHTML = "";
        const datos = nivelesHorarios[zonaNombre];
        horas.forEach((hora, i) => {
            const pm = datos[i];
            let texto = "";
            if (pm > 75) {
                texto = `A las ${hora} en ${zonaNombre}: utilizar mascarilla y evitar actividades físicas al aire libre (PM2.5 = ${pm} µg/m³).`;
            } else if (pm > 35) {
                texto = `A las ${hora} en ${zonaNombre}: moderar actividades físicas al aire libre y considerar protección (PM2.5 = ${pm} µg/m³).`;
            } else {
                texto = `A las ${hora} en ${zonaNombre}: seguro para realizar ejercicio o salir sin protección especial (PM2.5 = ${pm} µg/m³).`;
            }
            const li = document.createElement("li");
            li.textContent = texto;
            ul.appendChild(li);
        });
    };

    // Actualiza el gráfico con los datos de la zona seleccionada
    function actualizarGrafico(zonaNombre) {
        const datos = nivelesHorarios[zonaNombre];
        const colores = datos.map(pm25 => {
            if (pm25 > 75) return '#dc3545';
            if (pm25 > 35) return '#ffc107';
            return '#28a745';
        });

        grafico.data.datasets[0].data = datos;
        grafico.data.datasets[0].backgroundColor = colores;
        grafico.options.plugins = {
            title: {
                display: true,
                text: `Nivel PM2.5 en ${zonaNombre} durante el día`
            }
        };
        grafico.update();
    }

    // Calcula el promedio de un arreglo
    const calcularPromedio = (arr) => arr.reduce((acc, val) => acc + val, 0) / arr.length;

    // Determina el color según el valor de PM2.5
    const determinarColor = (valor) => 
        valor > 75 ? '#dc3545' : 
        valor > 35 ? '#ffc107' : 
        '#28a745';

    // Dibuja los círculos de cada zona en el mapa
    dataCalidadAire.zonas.forEach(zona => {
        const datosHorarios = nivelesHorarios[zona.nombre];
        
        const promedioPM25 = datosHorarios ? 
            calcularPromedio(datosHorarios) : 
            zona.pm25;
        
        const color = determinarColor(promedioPM25);

        const coords = ubicaciones[zona.nombre];
        if (coords) {
            const circulo = L.circle(coords, {
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                radius: 1000
            }).addTo(mapa);

            circulo.bindPopup(
                `<b>Zona: ${zona.nombre}</b><br>
                PM2.5: ${zona.pm25} µg/m³<br>
                PM10: ${zona.pm10} µg/m³<br>
                Promedio PM2.5: ${Math.round(promedioPM25)} µg/m³<br>
                <span style="color:${color}">●</span> ${getCalidadAire(promedioPM25)}<br><br>
                <button onclick="seleccionarZona('${zona.nombre}')">Ver gráfico horario</button>`
            );
        }
    });

    // Función global para seleccionar una zona y actualizar gráfico y recomendaciones
    window.seleccionarZona = function(zonaNombre) {
        actualizarGrafico(zonaNombre);
        generarRecomendaciones(zonaNombre);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Devuelve la descripción de la calidad del aire según el valor de PM2.5
    function getCalidadAire(pm25) {
        if (pm25 > 75) return "Calidad del aire mala";
        if (pm25 > 35) return "Calidad del aire moderada";
        return "Calidad del aire buena";
    }
});