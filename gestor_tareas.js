// Importamos los módulos necesarios de Node.js
const fs = require('fs'); // Módulo para interactuar con el sistema de archivos (File System)
const readline = require('readline'); // Módulo para leer la entrada del usuario en la consola

// --- Constantes y Definiciones ---
const ARCHIVO_TAREAS = 'tareas.json'; // Usaremos JSON en lugar de un archivo binario

// Equivalentes a los 'enum' en C
const Estado = {
    PENDIENTE: 1,
    EN_CURSO: 2,
    TERMINADA: 3,
    CANCELADA: 4,
};

const Dificultad = {
    FACIL: 1,
    MEDIO: 2,
    DIFICIL: 3,
};

// --- Clase Tarea (equivalente a la 'struct Tarea') ---
class Tarea {
    constructor(id, titulo, descripcion, fechaVencimiento, costo, dificultad) {
        const fechaActual = new Date().toLocaleString('es-AR');
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion || ''; // Valor por defecto si es nulo
        this.estado = Estado.PENDIENTE;
        this.dificultad = dificultad;
        this.fechaCreacion = fechaActual;
        this.fechaVencimiento = fechaVencimiento || '';
        this.fechaEdicion = fechaActual;
        this.costo = costo;
    }
}

// --- Variables Globales ---
let tareas = []; // Array que almacenará todas las tareas

// --- Lógica de la Aplicación ---

// Configuración para leer la entrada del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función auxiliar para hacer preguntas al usuario y obtener su respuesta
function preguntar(pregunta) {
    return new Promise(resolve => rl.question(pregunta, resolve));
}

// Carga las tareas desde el archivo JSON
function cargarTareas() {
    try {
        if (fs.existsSync(ARCHIVO_TAREAS)) {
            const datos = fs.readFileSync(ARCHIVO_TAREAS, 'utf8');
            tareas = JSON.parse(datos);
            console.log(`${tareas.length} tareas cargadas.`);
        }
    } catch (error) {
        console.error('Error al cargar las tareas:', error);
        tareas = []; // Empezar con un array vacío si hay un error
    }
}

// Guarda las tareas en el archivo JSON
function guardarTareas() {
    try {
        // JSON.stringify con 'null, 2' formatea el archivo para que sea legible
        fs.writeFileSync(ARCHIVO_TAREAS, JSON.stringify(tareas, null, 2));
    } catch (error) {
        console.error('Error al guardar las tareas:', error);
    }
}

// Convierte un valor de estado a su equivalente en texto
function estadoToStr(e) {
    // Object.keys(objeto) devuelve un array con los nombres de las propiedades
    return Object.keys(Estado).find(key => Estado[key] === e) || 'Desconocido';
}

// Muestra la dificultad con símbolos visuales
function mostrarDificultad(d) {
    switch (d) {
        case Dificultad.FACIL: console.log("[*--]"); break;
        case Dificultad.MEDIO: console.log("[**-]"); break;
        case Dificultad.DIFICIL: console.log("[***]"); break;
        default: console.log("[---]"); break;
    }
}

// Muestra una tarea con o sin detalles
function mostrarTarea(t, mostrarDetalle = false) {
    console.log(`ID: ${t.id}\nTitulo: ${t.titulo}`);
    if (mostrarDetalle) {
        console.log(`Descripcion: ${t.descripcion || "Sin descripcion"}`);
        console.log(`Estado: ${estadoToStr(t.estado)}`);
        process.stdout.write("Dificultad: "); // process.stdout.write no añade salto de línea
        mostrarDificultad(t.dificultad);
        console.log(`Costo: $${t.costo.toFixed(2)}`);
        console.log(`Fecha de creacion: ${t.fechaCreacion}`);
        console.log(`Fecha de vencimiento: ${t.fechaVencimiento || "Sin datos"}`);
        console.log(`Ultima edicion: ${t.fechaEdicion}`);
    }
    console.log("--------------------------");
}

// Agrega una nueva tarea al sistema (función asíncrona por la entrada del usuario)
async function agregarTarea() {
    console.clear();
    const titulo = await preguntar("Ingrese titulo: ");
    const descripcion = await preguntar("Ingrese descripcion (opcional): ");
    const fechaVencimiento = await preguntar("Ingrese fecha de vencimiento (dd/mm/aaaa HH:MM) o presione Enter: ");
    const costoStr = await preguntar("Ingrese costo: ");
    const costo = parseFloat(costoStr) || 0.0;
    
    let dif = parseInt(await preguntar("Ingrese dificultad (1. Facil, 2. Media, 3. Dificil): "));
    if (isNaN(dif) || dif < 1 || dif > 3) dif = Dificultad.FACIL;

    const id = tareas.length > 0 ? Math.max(...tareas.map(t => t.id)) + 1 : 1;
    const nueva = new Tarea(id, titulo, descripcion, fechaVencimiento, costo, dif);
    
    tareas.push(nueva);
    guardarTareas();
    console.log("Tarea guardada con exito.");
}

// Edita una tarea por su ID
async function editarTarea(id) {
    const tareaIndex = tareas.findIndex(t => t.id === id);
    if (tareaIndex === -1) {
        console.log("Tarea no encontrada.");
        return;
    }

    const tarea = tareas[tareaIndex];
    console.clear();
    console.log(`Editando tarea ID ${id}: "${tarea.titulo}"`);

    const nuevoTitulo = await preguntar(`Nuevo titulo (deje vacio para mantener: ${tarea.titulo}): `);
    if (nuevoTitulo) tarea.titulo = nuevoTitulo;
    
    const nuevaDesc = await preguntar(`Nueva descripcion (deje vacio para mantener): `);
    if (nuevaDesc) tarea.descripcion = nuevaDesc;

    const nuevoEstado = parseInt(await preguntar(`Nuevo estado (1.Pendiente, 2.En curso, 3.Terminada, 4.Cancelada): `));
    if (nuevoEstado >= 1 && nuevoEstado <= 4) tarea.estado = nuevoEstado;
    
    // ... agregar más campos para editar si se desea
    
    tarea.fechaEdicion = new Date().toLocaleString('es-AR');
    guardarTareas();
    console.log("Tarea editada exitosamente.");
}

// Borra una tarea por ID
async function borrarTarea(id) {
    const indice = tareas.findIndex(t => t.id === id);

    if (indice === -1) {
        console.log("Tarea no encontrada.");
        return;
    }
    
    console.clear();
    const confirmacion = await preguntar(`Estas seguro de que queres borrar la tarea "${tareas[indice].titulo}"? (S/N): `);

    if (confirmacion.toLowerCase() === 's') {
        tareas.splice(indice, 1); // Elimina el elemento del array
        guardarTareas();
        console.log("Tarea borrada exitosamente.");
    } else {
        console.log("Operacion cancelada.");
    }
}

// Lista tareas con opción a interactuar
async function listarTareas(filtro = 0) {
    console.clear();
    const tareasFiltradas = filtro === 0 ? tareas : tareas.filter(t => t.estado === filtro);
    
    if (tareasFiltradas.length === 0) {
        console.log("No hay tareas para mostrar con ese filtro.");
        return;
    }

    tareasFiltradas.forEach(t => mostrarTarea(t));
    
    const id = parseInt(await preguntar("Ingrese ID de tarea para ver detalles, editar o borrar (0 para volver): "));
    if (id === 0) return;

    const tareaSeleccionada = tareas.find(t => t.id === id);
    if (tareaSeleccionada) {
        console.clear();
        mostrarTarea(tareaSeleccionada, true);
        const eleccion = await preguntar("Presione E para editar, B para borrar o cualquier otra tecla para volver: ");
        if (eleccion.toLowerCase() === 'e') {
            await editarTarea(id);
        } else if (eleccion.toLowerCase() === 'b') {
            await borrarTarea(id);
        }
    } else {
        console.log("Tarea no encontrada.");
    }
}

// Busca tareas por palabra clave
async function buscarTarea() {
    console.clear();
    const palabra = await preguntar("Ingrese palabra a buscar en titulos: ");
    const resultados = tareas.filter(t => t.titulo.toLowerCase().includes(palabra.toLowerCase()));

    if (resultados.length === 0) {
        console.log("No se encontraron tareas con esa palabra.");
    } else {
        console.log(`${resultados.length} tareas encontradas:`);
        resultados.forEach(t => mostrarTarea(t));
        // Aquí se podría añadir la misma lógica de listarTareas para interactuar con los resultados
    }
}


// --- Menú Principal y Ejecución ---
async function menuPrincipal() {
    let salir = false;
    while (!salir) {
        console.log("\n--- MENU PRINCIPAL ---");
        console.log("1. Ver tareas");
        console.log("2. Buscar tarea");
        console.log("3. Agregar tarea");
        console.log("4. Editar tarea");
        console.log("5. Borrar tarea");
        console.log("0. Salir");
        const opcion = await preguntar("Seleccione una opcion: ");

        switch (opcion) {
            case '1':
                console.clear();
                const sub = await preguntar("Filtrar por: 1.Todas, 2.Pendientes, 3.En curso, 4.Terminadas (0 para volver): ");
                const filtroMap = {'1': 0, '2': 1, '3': 2, '4': 3};
                await listarTareas(filtroMap[sub] ?? 0);
                break;
            case '2':
                await buscarTarea();
                break;
            case '3':
                await agregarTarea();
                break;
            case '4':
                const idEditar = parseInt(await preguntar("Ingrese el ID de la tarea a editar: "));
                await editarTarea(idEditar);
                break;
            case '5':
                 const idBorrar = parseInt(await preguntar("Ingrese el ID de la tarea a borrar: "));
                await borrarTarea(idBorrar);
                break;
            case '0':
                salir = true;
                console.clear();
                console.log("Saliendo...");
                break;
            default:
                console.clear();
                console.log("Opcion invalida.");
        }
        await preguntar("\nPresione Enter para continuar...");
        console.clear();
    }
    rl.close(); // Cierra la interfaz de lectura
}

// --- Punto de Entrada de la Aplicación ---
function main() {
    console.clear();
    cargarTareas();
    menuPrincipal();
}

main();