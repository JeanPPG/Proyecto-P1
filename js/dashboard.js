document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el gráfico de líneas PM2.5
    const ctx = document.getElementById('graficoPM25').getContext('2d');
    const grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['08:00', '10:00', '12:00', '14:00', '16:00'],
            datasets: [{
                label: 'PM2.5',
                data: [45, 60, 75, 80, 65],
                borderColor: 'rgba(220, 53, 69, 1)',
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                fill: true,
                tension: 0.3
            }]
        }
    });

    // Coordenadas de la ESPE y Quito
    const coordenadasESPE = [-0.3127, -78.4461]; // Latitud, Longitud de la ESPE (Campus Sangolquí)
    
    // Centrar mapa en la ESPE en lugar de Quito para asegurar que sea visible
    const mapa = L.map('mapa').setView(coordenadasESPE, 13); // Zoom aumentado para ver mejor
    
    // Añadir la capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    
    // Agregar un marcador para la ESPE (más visible que solo el círculo)
    const marcadorESPE = L.marker(coordenadasESPE).addTo(mapa)
        .bindPopup("<b>Universidad de las Fuerzas Armadas ESPE</b>")
        .openPopup();
    
    // Crear círculo rojo para la ESPE con radio más grande
    L.circle(coordenadasESPE, {
        color: "#dc3545",        // Color rojo
        fillColor: "#dc3545",    // Relleno rojo
        fillOpacity: 0.7,        // Más opaco para destacar
        radius: 1200              // Radio aumentado a 1200m para mayor visibilidad
    }).addTo(mapa).bindPopup(
        "<b>Universidad de las Fuerzas Armadas ESPE</b><br>" +
        "PM2.5: 90 µg/m³<br>" +
        "PM10: 115 µg/m³<br>" +
        "<span style='color:#dc3545'>●</span> Calidad del aire mala"
    );
    
    console.log("Círculo de la ESPE añadido al mapa"); // Verificación en consola
    
    // Cargar datos de contaminación
    fetch('data/calidad_aire.json')
        .then(response => response.json())
        .then(data => {
            // Definir coordenadas para las zonas (ejemplo - ajustar según ubicaciones reales)
            const ubicaciones = {
                "Centro": [-0.2200, -78.5100],
                "Norte": [-0.1500, -78.4800],
                "Sur": [-0.2500, -78.5300]
            };
            
            // Mostrar zonas con contaminación
            data.zonas.forEach(zona => {
                // Determinar el color según el nivel de PM2.5
                let color = "#28a745"; // Verde por defecto
                if (zona.pm25 > 75) {
                    color = "#dc3545"; // Rojo para alta contaminación
                } else if (zona.pm25 > 35) {
                    color = "#ffc107"; // Amarillo para media contaminación
                }
                
                if (ubicaciones[zona.nombre]) {
                    // Crear círculo para representar la zona y su nivel de contaminación
                    L.circle(ubicaciones[zona.nombre], {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.5,
                        radius: 1000 // Radio de 1km
                    }).addTo(mapa).bindPopup(
                        `<b>Zona: ${zona.nombre}</b><br>
                        PM2.5: ${zona.pm25} µg/m³<br>
                        PM10: ${zona.pm10} µg/m³<br>
                        <span style="color:${color}">●</span> ${getCalidadAire(zona.pm25)}`
                    );
                }
            });
        }).catch(error => {
            console.error("Error cargando datos de calidad del aire:", error);
        });
    
    // Función para determinar la calidad del aire
    function getCalidadAire(pm25) {
        if (pm25 > 75) return "Calidad del aire mala";
        if (pm25 > 35) return "Calidad del aire moderada";
        return "Calidad del aire buena";
    }

    // Recomendaciones según calidad del aire
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

