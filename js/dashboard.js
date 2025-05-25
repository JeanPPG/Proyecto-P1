document.addEventListener('DOMContentLoaded', () => {
    const coordenadasESPE = [-0.3127, -78.4461];
    const mapa = L.map('mapa').setView(coordenadasESPE, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    L.marker(coordenadasESPE).addTo(mapa)
        .bindPopup("<b>Universidad de las Fuerzas Armadas ESPE</b>")
        .openPopup();

    L.circle(coordenadasESPE, {
        color: "#dc3545",
        fillColor: "#dc3545",
        fillOpacity: 0.7,
        radius: 1200
    }).addTo(mapa).bindPopup(
        "<b>Universidad de las Fuerzas Armadas ESPE</b><br>" +
        "PM2.5: 90 µg/m³<br>" +
        "PM10: 115 µg/m³<br>" +
        "<span style='color:#dc3545'>●</span> Calidad del aire mala<br> "+
        "<button onclick=\"seleccionarZona('ESPE')\">Ver gráfico horario</button>"
    );

    const dataCalidadAire = {
        zonas: [
            { nombre: "Centro", pm25: 95, pm10: 120 },
            { nombre: "Norte", pm25: 35, pm10: 45 },
            { nombre: "Sur", pm25: 80, pm10: 100 },
        ]
    };

    const ubicaciones = {
        "Centro": [-0.2200, -78.5100],
        "Norte": [-0.1500, -78.4800],
        "Sur": [-0.2500, -78.5300]
    };

    const horas = ['08:00', '10:00', '12:00', '14:00', '16:00'];

    // Simulación de niveles horarios de PM2.5 por zona
    const nivelesHorarios = {
        "Centro": [90, 100, 110, 95, 85],
        "Norte": [20, 30, 40, 35, 25],
        "Sur": [60, 70, 85, 80, 75],
        "ESPE": [90, 95, 100, 90, 85]
    };

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

    function actualizarGrafico(zonaNombre) {
        const datos = nivelesHorarios[zonaNombre];
        const colores = datos.map(pm25 => {
            if (pm25 > 75) return '#dc3545'; // rojo
            if (pm25 > 35) return '#ffc107'; // amarillo
            return '#28a745';                // verde
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

    dataCalidadAire.zonas.forEach(zona => {
        const color = zona.pm25 > 75 ? '#dc3545' :
                      zona.pm25 > 35 ? '#ffc107' : '#28a745';

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
                <span style="color:${color}">●</span> ${getCalidadAire(zona.pm25)}<br><br>
                <button onclick="seleccionarZona('${zona.nombre}')">Ver gráfico horario</button>`
            );
        }
    });

    // Hacer accesible globalmente la función de selección
    window.seleccionarZona = function(zonaNombre) {
        actualizarGrafico(zonaNombre);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function getCalidadAire(pm25) {
        if (pm25 > 75) return "Calidad del aire mala";
        if (pm25 > 35) return "Calidad del aire moderada";
        return "Calidad del aire buena";
    }

    const recomendaciones = [
        "Evite hacer ejercicio al aire libre en zonas rojas.",
        "Use mascarilla si debe transitar por zonas con alta contaminación.",
        "Permanezca en interiores durante niveles altos de contaminación.",
        "Consulte el mapa antes de realizar actividades al aire libre."
    ];

    const ul = document.getElementById("listaRecomendaciones");
    recomendaciones.forEach(r => {
        const li = document.createElement("li");
        li.textContent = r;
        ul.appendChild(li);
    });
});
