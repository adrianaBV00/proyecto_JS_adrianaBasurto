
class Producto{
    constructor(id, nombre, precio, cantidad, imagen){
        this.id = parseInt(id);
        this.nombre = nombre.toUpperCase();
        this.precio = parseFloat(precio).toFixed(2); 
        this.cantidad = parseInt(cantidad);
        this.imagen = imagen;
        this.subtotal = 0;
    }

    obtenerTotal(){
        this.subtotal = this.precio * this.cantidad;
    }


}

let ProductosTienda={
    productos:[],

    crearProducto: function(id, nombre, precio, categoria, descripcion, cantidad, imagen, enStock){
        let nuevo_producto = {}; 
        nuevo_producto.id = id;
        nuevo_producto.nombre = nombre;
        nuevo_producto.precio = parseFloat(precio);
        nuevo_producto.categoria = categoria;
        nuevo_producto.descripcion = descripcion;
        nuevo_producto.cantidad = parseInt(cantidad);
        nuevo_producto.imagen = "https://png.pngtree.com/png-vector/20190330/ourmid/pngtree-img-file-document-icon-png-image_897560.jpg";
        nuevo_producto.enStock = enStock;
        this.productos.push(nuevo_producto);
    },
    
    productos_disponibles: function(){
        return this.productos.filter(producto=>producto.enStock);

    },

    filtrar_categoria: function(categoria){
        return this.productos.filter(producto=>producto.categoria===categoria);

    },

    sort_productos: function(forma){
        if(forma === "precio_low"){
            this.productos.sort((a,b)=>b.precio-a.precio)
        }
        else if(forma === "precio_high"){
            this.productos.sort((a,b)=>a.precio-b.precio)
        }
        else if(forma === "a_z"){
            this.productos.sort((a,b)=>b.nombre.localeCompare(a.nombre))
        }
        else if(forma === "z_a"){
            this.productos.sort((a,b)=>a.nombre.localeCompare(b.nombre))
        }

    },

    actualizar_productos: function(producto_actualizar,action){
        const modificar = this.productos.some(producto=>producto.id==producto_actualizar.id);
        if(modificar){
            const productos = this.productos.map(producto=>{
                if (producto.id==producto_actualizar.id){
                    if(action==="agregar_carrito"){
                        producto.cantidad-=parseInt(producto_actualizar.cantidad);
                    }
                    else if(action==="regresar_stock"){
                        producto.cantidad+=parseInt(producto_actualizar.cantidad);
                    }

                    producto.enStock = parseInt(producto.cantidad)>0;
                    return producto;

                }
                return producto;
            });
            this.productos = productos;

            return true;

        }
        else{
            return false;
        }

    },

    find_producto: function(producto_buscar){
        return this.productos.find(producto=>producto.id==producto_buscar.id);
    },

    max_cantidad: function(producto_buscar){
        const producto_encontrar = this.find_producto(producto_buscar);
        if(producto_encontrar){
            return producto_encontrar.cantidad;
        }
        else{
            return 0;
        }
        
    }



}



let Carrito ={
    carrito: [],

    carrito_vacio:function(){
        return this.carrito.length>0?false:true;
    },

    cargar_carrito_local_storage:function(){
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];  
    },

    actualizar_carrito_local_storage:function(){
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
    },

    agregar_al_carrito:function(producto_agregar){
        const existe_en_carrito = this.carrito.some(producto=>producto.id==producto_agregar.id);
        if(existe_en_carrito){
            const productos = this.carrito.map(producto=>{
                if(producto.id===producto_agregar.id){
                    producto.cantidad+=producto_agregar.cantidad;
                    producto.obtenerTotal();
                }
                return producto;
            } );
            this.carrito = productos;
        }
        else{
            producto_agregar.obtenerTotal();
            this.carrito.push(producto_agregar);
        }
        console.log(this.carrito);
        this.actualizar_carrito_local_storage();
        

    },

    precio_total_carrito: function(){
        return this.carrito.reduce((total, producto)=> total + producto.subtotal, 0);
    },

    articulos_totales: function(){
        return this.carrito.reduce((art_totales, producto)=> art_totales + producto.cantidad, 0);
    },


    eliminar_del_carrito:function(id){
        if(!this.carrito_vacio()){
            const eliminado = this.carrito.find(p=>p.id==id);
            this.carrito = this.carrito.filter(p=>p.id!=id);
            this.actualizar_carrito_local_storage();
            return eliminado;
        }

    },

    limpiar_carrito:function(){
        this.carrito = [];
        this.actualizar_carrito_local_storage;
    },

    find_producto:function(id){
        return this.carrito.find(p=>p.id===id)

    }

}


const shop_cart = document.getElementById("carrito");
const modal_producto = document.getElementById('modal_producto');
const modal_carrito = document.getElementById('modal_carrito');
const contenedor_productos = document.getElementById('contenedor_productos');
const contenedor_carrito = document.querySelector('.modal-body-carrito')
const contenedor_agregar = document.querySelector('.modal-body-producto')
const total_art = document.getElementById('art_totales');
const total_carrito = document.getElementById("total");
const btn_cerrar_carrito = document.getElementById("btn_cerrar_carrito");
const btn_cerrar_producto = document.getElementById("btn_cerrar_producto");
const btn_agregar_carrito = document.getElementById("btn_agregar_carrito");
const title = document.querySelector(".modal-title-producto");
const btn_vaciar_cart = document.getElementById("vaciar_carrito");
const btn_finalizar = document.getElementById("finalizar_compra");

function main(){
    document.addEventListener("DOMContentLoaded",()=>{
        show_productos();
        Carrito.cargar_carrito_local_storage();
        show_carrito();
    });
    
    shop_cart.onclick = function(){
        show_modal(modal_carrito);
        show_carrito();
    };

    btn_cerrar_carrito.onclick = function(){
        ocultar_modal(modal_carrito)
    };

    btn_cerrar_producto.onclick = function(){
        ocultar_modal(modal_producto)
    };

    btn_agregar_carrito.onclick = function(){
        add_carrito();
        ocultar_modal(modal_producto);
    };
    btn_vaciar_cart.onclick = function(){
        vaciar_cart();
    };
    btn_finalizar.onclick = function(){
        finalizar_cart();
    };

}


function limpiarHTML(contenedor){
    while(contenedor.firstChild){
        contenedor.removeChild(contenedor.firstChild);
    }
}

function show_productos(){
    limpiarHTML(contenedor_productos);
    ProductosTienda.productos.forEach(producto=>{
        const {id, nombre, precio, categoria, descripcion, cantidad, imagen, enStock} = producto;
        let card_producto = document.createElement("div");
        card_producto.classList= "card";
        const text_boton = enStock?"Agregar":"AGOTADO";
        const btn_disable = enStock?"": "disabled";
        const class_btn = enStock?"btn btn-primary": "btn btn-outline-danger";
        card_producto.innerHTML = `
            
            <div class="card-body">
                <h5 class="card-title">${nombre}</h5>
                <p class="card-text"> Categoria: ${categoria}</p>
                <p class="card-text"> Descripcion: ${descripcion}</p>
                <p class="card-text"> Precio: ${precio}</p>

                <button id="btn_agregar${id}" class="${class_btn}" ${btn_disable}>${text_boton}</button>
            </div>
        `;

        contenedor_productos.appendChild(card_producto);
        const boton_agregar = document.getElementById(`btn_agregar${id}`)

        boton_agregar.addEventListener("click",()=>{
            show_modal(modal_producto);

            // Carrito.agregar_al_carrito(new Producto(id, nombre, precio, cantidad, imagen))
            // show_carrito();
            
            title.innerHTML = `${nombre}`;
            contenedor_agregar.innerHTML = `
                <div class="card card_producto" id="card_${id}">
                    <div class="card-body">
                        <p class="card-text">Categoria: ${categoria}</p>
                        <p class="card-text">Descripcion: ${descripcion}</p>
                        <p class="card-text">Precio: $${precio}</p>
                        <label for="quantity">Cantidad:</label>
                        <input value="1" type="number" id="quantity" name="quantity" min="1" max="${ProductosTienda.max_cantidad(producto)}"><br><br>
                    </div>
                </div>

            `;


            

        });


        // show modal mostrar producto
    });
     

}

function show_modal(modal){
    modal.style.display = 'block';
}

function ocultar_modal(modal){
    modal.style.display = 'none';
    
}

function add_carrito(){
    const info = document.querySelector(".card_producto");
    const producto_agregar = leer_datos(info);
    console.log(ProductosTienda.max_cantidad(producto_agregar));
    if(ProductosTienda.max_cantidad(producto_agregar)>=producto_agregar.cantidad){
        Carrito.agregar_al_carrito(producto_agregar);
        ProductosTienda.actualizar_productos(producto_agregar,"agregar_carrito")
        mostrar_cantidad_productos();
        console.log(ProductosTienda.productos);
        show_productos();
    }

}

function leer_datos(info){
    let id,nombre,descripcion,precio,cantidad, img;
    const datos = info.querySelectorAll(".card-text");
    // img = info.querySelector("img").src;
    id = info.getAttribute("id").replace("card_","");
    nombre = title.textContent;
    categoria = datos[0].textContent.replace("Categoria: ","");
    descripcion = datos[1].textContent.replace("Descripcion: ","");
    precio = Number(datos[2].textContent.replace("Precio: $",""));
    cantidad = Number(info.querySelector("#quantity").value)

    return new Producto(id, nombre, precio, cantidad, img)
}


function show_carrito(){
    limpiarHTML(contenedor_carrito);
    if(Carrito.carrito_vacio()){
        contenedor_carrito.innerHTML = "Su carrito esta vacio";
    }
    else{
        Carrito.carrito.forEach(producto=>{
            const {id, nombre, precio, cantidad, imagen, subtotal} = producto;
            let card_producto = document.createElement("div");
            card_producto.classList= `
                <p>Carrito vacio</p>
            `;
            card_producto.innerHTML = `

                <div class="card-body">
                    <h5 class="card-title">${nombre}</h5>
                    <p class="card-text"> Precio: $${precio}</p>
                    <p class="card-text"> Cantidad: ${cantidad}</p>
                    <p class="card-text"> Subtotal: ${subtotal}</p>
                    <button id="${id}" class="btn btn-secondary eliminar-producto"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            contenedor_carrito.appendChild(card_producto);
            const boton_eliminar = document.getElementById(`${id}`)

            boton_eliminar.addEventListener("click",()=>{
                console.log(id)
                eliminar_del_carrito(id);
                show_carrito();
                show_productos();
            })

        });
        
        
    }
    mostrar_cantidad_productos();
    calcular_total();




}



function mostrar_cantidad_productos(){
    if(!Carrito.carrito_vacio()){
        shop_cart.style.display ="flex";
        total_art.style.display='block';
        total_art.innerHTML = `${Carrito.articulos_totales()}`;

    }
    else{
        shop_cart.style.display ="block";
        total_art.style.display='none';
    }
}

function calcular_total(){

    total_carrito.innerHTML = Carrito.carrito_vacio()?"":`Total a pagar: $ ${Carrito.precio_total_carrito().toFixed(2)}`
}

function eliminar_del_carrito(id){
    const eliminado=Carrito.eliminar_del_carrito(id);
    console.log(eliminado);
    ProductosTienda.actualizar_productos(eliminado,"regresar_stock");    

}

function finalizar_cart(){
    Carrito.limpiar_carrito();
    show_carrito();
}

function vaciar_cart(){
    Carrito.carrito.forEach(producto=>eliminar_del_carrito(producto.id));
    show_carrito();
    show_productos()
}

// Creacion de productos
productos_tienda.forEach(producto=>ProductosTienda.crearProducto(producto.id, producto.nombre, producto.precio, producto.categoria, producto.descripcion, producto.cantidad, producto.imagen, producto.enStock));

// cargar carrito
Carrito.cargar_carrito_local_storage();


main();



