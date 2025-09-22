const prompt = require("prompt-sync")();

// Calculadora básica en JavaScript

// Función para pedir un número al usuario
function pedirNumero(mensaje) {
  let num;
  do {
    num = prompt(mensaje); // pide el número
  } while (isNaN(num)); // repite si no es un número
  return parseFloat(num); // convierte a número decimal
}

// Función para pedir el operador
function pedirOperador() {
  let op;
  do {
    op = prompt("Ingrese el operador (+, -, *, /):");
  } while (op !== "+" && op !== "-" && op !== "*" && op !== "/");
  return op;
}

// Función para realizar la operación
function calcular(a, b, operador) {
  if (operador === "+") return a + b;
  if (operador === "-") return a - b;
  if (operador === "*") return a * b;
  if (operador === "/") {
    if (b === 0) {
      return "Error: división por cero";
    } else {
      return a / b;
    }
  }
}

// --- Programa principal ---
let numero1 = pedirNumero("Ingrese el primer número:");
let numero2 = pedirNumero("Ingrese el segundo número:");
let operador = pedirOperador();

let resultado = calcular(numero1, numero2, operador);

alert("El resultado es: " + resultado);
