class Producto{
    constructor(id, nombre, precio, cantidad){
        this.id = id;
        this.nombre = nombre.toUpperCase();
        this.precio = parseFloat(precio);
        this.cantidad = parseInt(cantidad);
    }

    mostrar_info(){
        return `ID: ${this.id}\nNombre: ${this.nombre}\nPrecio: ${this.precio}\nCantidad: ${this.cantidad}`
    }

    vender_producto(cantidad){
        if(cantidad>this.cantidad || !this.esta_disponible()){
            return false;
        }
        else{
            this.cantidad -= parseInt(cantidad);
            return true;
        }
    }

    regresar_producto(cantidad){
        this.cantidad+=parseInt(cantidad);
    }

    esta_disponible(){
        if(this.cantidad===0){
            return false;
        }
        else{
            return true;
        }
    }


}

let ProductosTienda={
    productos:[],

    crearProducto:function(id, nombre, precio, cantidad){
        this.productos.push(new Producto(id, nombre, precio, cantidad));
        // this.sort_productos();
    },
    
    mostrar_productos_disponibles: function(){
        let show_info="Productos disponibles\n ***********************\n";
        for(const producto of this.productos){
            if(!producto.esta_disponible()){
                continue;
            }
            else{
                show_info+=`${producto.mostrar_info()}\n`;
                show_info+='***********************\n';

            }
        }
        return show_info;

    },

    sort_productos: function(){
        if(this.productos.length>0){
            this.productos.sort((a,b)=>b.cantidad-a.cantidad)
        }

    },

    actualizar_producto: function(producto){
        const modificar = this.productos.find(p=>p.id===producto.id);
        if(modificar){
            modificar.regresar_producto(producto.cantidad);

        }
        else{
            return false;
        }

    }



}



let Carrito ={
    carrito: [],

    carrito_vacio:function(){
        return this.carrito.length>0?false:true;
    },
    show_carrito: function(){
        
        if(!this.carrito_vacio()){
            let show_info="TU CARRITO\n";
            show_info+='***********************\n';
            for(const producto of this.carrito){
                
                show_info+=`${this.mostrar_info(producto)}`;
                show_info+='***********************\n';
            }

            return show_info;
        }
        else{
            return "Su carrito esta vacio"
        }
    },

    resume: function(){
        let total=0;
        let articulos =0;
        for(const producto of this.carrito){
            total += producto.total;
            articulos += producto.cantidad;
        }

        return {total:total, articulos:articulos};

    },

    agregar_al_carrito:function(producto, cantidad){
        if(producto.vender_producto(cantidad)){
            const producto_en_carrito = this.find_producto(producto.id);
            if(producto_en_carrito){
                producto_en_carrito.cantidad+=parseInt(cantidad);
                producto_en_carrito.total =  producto_en_carrito.cantidad*producto_en_carrito.precio;
            }
            else{
                this.carrito.push({id:producto.id,nombre:producto.nombre, precio:producto.precio, cantidad:cantidad, total:cantidad*producto.precio});
            }
            
            return "Se ha agregado a tu carrito exitosamente";
        }
        else{
            return "El producto no esta disponible para esa cantidad"
        }
        
    },

    mostrar_info: function(producto){
        return `ID: ${producto.id}\nNombre: ${producto.nombre}\nPrecio: ${producto.precio}\nCantidad: ${producto.cantidad}\nTotal: ${producto.total}\n`
    },

    eliminar_del_carrito:function(id){
        if(this.carrito.length>0){
            let eliminado = this.find_producto(id);
            if(eliminado){
                this.carrito = this.carrito.filter(p=>p.id!==id);
            }
            
            return eliminado;
        }
        
        else{
            return false
        }
        

    },

    find_producto:function(id){
        return this.carrito.find(p=>p.id===id)

    }

}



let opcion;
const MENU = ["Ver carrito", "Agregar producto al carrito", "Eliminar un producto del carrito", "Total a pagar", "Salir"];


// Creacion de productos
ProductosTienda.crearProducto(1, 'audifonos', 350, 5);
ProductosTienda.crearProducto(2, 'laptop HP', 15998.78, 3);
ProductosTienda.crearProducto(3, 'Television 35in', 3456.80, 10);
ProductosTienda.crearProducto(4, 'Smartphone ultima generacion', 23450.32, 8);
// ProductosTienda.crearProducto(5, 'Smartwatch 10', 7530.56, 1);


// funciones del Menu
let ver_carrito= function(){
    alert(Carrito.show_carrito());
}

let comprar_producto = function(){
    let id_producto = Number(prompt(`Selecciona el indice del producto que deseas agregar (numero)\n ${ProductosTienda.mostrar_productos_disponibles()}`));
    let producto = ProductosTienda.productos.find(p=>p.id===id_producto);
    if(producto){
        let cantidad = parseInt(prompt(`Ingrese la cantidad que desea comprar:\n ${producto.mostrar_info()}`));
        // console.log(typeof cantidad);
        if(!isNaN(cantidad)){
            alert(Carrito.agregar_al_carrito(producto, cantidad));
        }
        else{
            alert("Valor invalido")
        }

    }
    else{
        alert("ID invalido")
    }
    

}

let eliminar_del_carrito = function(){
    if(Carrito.carrito_vacio()){
        alert("Tu carrito esta vacio")
    }
    else{
        let id_producto = Number(prompt(`Selecciona el indice del producto que deseas eliminar del carrito (numero)\n ${Carrito.show_carrito()}`));
        let producto_eliminado = Carrito.eliminar_del_carrito(id_producto);
        if(producto_eliminado){
            alert(`Se ha eliminado de tu carrito el siguiente articulo:\n${Carrito.mostrar_info(producto_eliminado)}`)
            ProductosTienda.actualizar_producto(producto_eliminado);
        }
        else{
            alert("ID invalido")
        }
        
    }
    
}

let total_a_pagar = function(){
    if(Carrito.carrito_vacio()){
        alert("Tu carrito esta vacio");
    }
    else{
        let resume = Carrito.resume();

        alert(`Total articulos: ${resume.articulos}\nTotal a pagar: ${resume.total}`)
    }    

}



do{
    let info = "Elige una opcion (numero):\n"
    for(let i=0; i<MENU.length; i++){
        info+=`${i+1}.- ${MENU[i]}\n`
    }

    opcion = parseInt(prompt(info))
    // console.log(opcion)
    if(!isNaN(opcion)){
        // ver carrito
        if(opcion===1){
            ver_carrito();
        }
        // Comprar un producto
        else if(opcion===2){
            comprar_producto();
        }

        // Eliminar un producto del carrito
        else if(opcion===3){
            eliminar_del_carrito();
        }

        // Total a pagar
        else if(opcion===4){
            total_a_pagar();
        }

        else if(opcion!==5){
            alert("Opcion invalida")
        }
        
    }

}while(opcion !== MENU.length);