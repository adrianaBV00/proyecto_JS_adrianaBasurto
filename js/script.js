
const INFO_PRODUCT = ["id", "brand", "name", "price", "image_link", "description", "rating",
        "category", "product_type"
    ];
const URL_DATA = "https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Vegan&price_greater_than=0";
const CARRITO_LS = "carrito";
const shop_cart = document.getElementById("carrito");
const modal_producto = document.getElementById('modal_producto');
// const modal_carrito = document.getElementById('modal_carrito');
const contenedor_productos = document.getElementById('contenedor_productos');
const contenedor_carrito = document.querySelector('.contenedor-carrito');
const contenedor = document.getElementById('contenedor');
const contenedor_modal_producto = document.querySelector('.modal-body-producto');
const total_art = document.getElementById('art_totales');
const total_carrito = document.getElementById("total_carrito");
const total_num = document.getElementById("total_num");
const btn_cerrar_carrito = document.getElementById("btn_cerrar_carrito");
const btn_cerrar_producto = document.getElementById("btn_cerrar_producto");
const btn_agregar_carrito = document.getElementById("btn_agregar_carrito");
const btn_vaciar_cart = document.getElementById("vaciar_carrito");
const btn_finalizar = document.getElementById("finalizar_compra");
const STAR_RATING = 5;
const btn_buscar = document.getElementById("btn-buscar");
const btn_menos = document.getElementById("btn_menos");
const btn_mas = document.getElementById("btn_mas");
const cantidad = document.getElementById("cantidad");
const INICIO = document.getElementById("logo");
const contenedor_ordenar = document.getElementById("ordenarBy");
const ERROR = "error";
const SUCCESS = "success";
const MSJ_ERROR = "Error de conexion\n Intentelo mas tarde";
const MSJ_ADD_CART = "Se ha agregado el producto al carrito";
const ORDENAR = ["Precio menor", "Precio mayor", "A-Z", "Z-A"]
const filtros = document.getElementById("filtros");
let carrito = [];
let categorias = [];
let marcas = [];
let ordenarBy="";

let info={marcas:[],categoria:[]};
let totalVendido;

class Producto{
    constructor(id, brand, name, price, image_link, description, rating, category, cantidad){
        this.id = Number(id);
        this.brand = brand.toUpperCase();
        this.name = name;
        this.price = Number(price);
        this.image = image_link;
        this.description = description;
        this.rating = rating;
        this.category = category;
        this.cantidad = Number(cantidad);
        this.subtotal = 0;
    }

    obtenerTotal(){
        this.subtotal = Number(this.price * this.cantidad);
    }


}

// Funciones del carrito locale storage
function emptyCarrito(){
    return carrito.length===0;
}
function getCarritoLS(){
    carrito = JSON.parse(localStorage.getItem(CARRITO_LS)) || [];
}
function actualizarCarritoLS(){
    localStorage.setItem(CARRITO_LS,JSON.stringify(carrito))
}
function addCarrito(add_product){
    const existe_en_carrito = carrito.some(product => product.id===add_product.id);
    if(existe_en_carrito){
        const productos = carrito.map(producto =>{
            if(producto.id === add_product.id){
                producto.cantidad+=add_product.cantidad;
                producto.subtotal = producto.price*producto.cantidad;
                
            }
            return producto;
        });

        carrito = productos;

    }
    else{
        add_product.obtenerTotal();
        carrito.push(add_product);
    }

    actualizarCarritoLS();
}

function totalCarrito(){
    return carrito.reduce((total,product)=>total+product.subtotal,0);
}

function articulosCarrito(){
    return carrito.reduce((articulos,product)=>articulos+product.cantidad,0);
}

function vaciarCarrito(){
    carrito = [];
    actualizarCarritoLS();
}

function eliminarProducto(id){
    if(!emptyCarrito()){
        const eliminado = carrito.filter(producto => producto.id===id);
        if(eliminado){
            carrito = carrito.filter(producto => producto.id!==id);
            actualizarCarritoLS();
        }
        return eliminado;
    }
}

function finalizarCarrito(){
    totalVendido+= totalCarrito();
    localStorage.setItem('Total_vendido',totalVendido.toFixed(2));
    vaciarCarrito()
}


function inicializar(){
    getCarritoLS();
    actualizarCarritoLS();
    totalVendido = Number(localStorage.getItem('Total_vendido'))??0.0;
    localStorage.getItem('Total_vendido')??localStorage.setItem('Total_vendido',totalVendido.toFixed(2));
    inicializarOrdenar();
}

function inicializarOrdenar(){
    contenedor_ordenar.innerHTML="";
    for(let i of ORDENAR){
        contenedor_ordenar.innerHTML += `
            <li><a class="dropdown-item" href="#" id="${i}" >${i}</a></li>
        `
    }
    
}

async function ordenar(tipo, data=null){
    let temp = data??await fetchData(URL_DATA);
    if(temp){
        switch(tipo){
            case ORDENAR[0]:
                temp.sort((a,b)=>Number(a.price)-Number(b.price));
                break;
            case ORDENAR[1]:
                temp.sort((a,b)=>Number(b.price)-Number(a.price));
                break;
            case ORDENAR[2]:
                temp.sort((a,b)=>a.name.localeCompare(b.name));
                break;
            case ORDENAR[3]:
                temp.sort((a,b)=>b.name.localeCompare(a.name));
                break;
            default:
                break;

        }
        limpiarHTML(contenedor_productos);
        return temp;

    }

}

function removerClass(element,clase, remove_clase){
    let temp = element.querySelectorAll(`.${clase}`);
    temp.forEach(element=>element.classList.remove(remove_clase))
}

async function funcionFiltrar(event){
    if(event.target.id==='limpiarFiltros'){
        limpiarFiltros();
    }
    if(event.target.getAttribute("type")==="checkbox"){
        let tipo_filtro = event.target.getAttribute("data-filtro");
        if(event.target.checked){
            event.target.classList.add("checked-filtro");
        }
        else{
            event.target.classList.remove("checked-filtro");
        }
        info={marcas:[],categoria:[]};
        document.querySelectorAll(".checked-filtro").forEach(element=>{
            if(element.getAttribute("data-filtro")==="marcas" && !info.marcas.includes(element.value)){
                info.marcas.push(element.value);
            }
            if(element.getAttribute("data-filtro")==="categoria" && !info.categoria.includes(element.value)){
                info.categoria.push(element.value);
            }
        });
        renderizarProductos(realizarFiltros(await ordenar(getTipoOrdenar())));
    }
    
}

function realizarFiltros(data){
    if(!(info.marcas.length===0 && info.categoria.length===0)){
        data = data.filter(element=>{
            if(info.categoria.length>0 && info.marcas.length>0){
                return info.categoria.includes(element.category) && info.marcas.includes(element.brand);
            }
            if(info.categoria || info.marcas){
                return info.categoria.includes(element.category) || info.marcas.includes(element.brand);
            }
            
        });
    }
    return data;  
}

function buscarProducto(data,info){
    data = data.filter(element=>{
        return element.name.toLowerCase().includes(info.toLowerCase());
    });
    // console.log(data)
    return data;

}

function limpiarFiltros(){
    filtros.querySelectorAll(".form-check-input").forEach(filtro=>{
        filtro.checked = false;
    })
    showProductos();
}


function inicializarFiltros(filtro,array){
    let elementDOM = document.getElementById(filtro);
    elementDOM.innerHTML='';
    // console.log(categorias);
    array.forEach(element=>{
        elementDOM.innerHTML+=`
            <div class="form-check">
                <input data-filtro="${filtro}" class="form-check-input" type="checkbox" value="${element}" id="check${element}">
                <label class="form-check-label" for="check${element}">
                    ${element}
                </label>
            </div>
        `

    })

}
function getTipoOrdenar(){
    return contenedor_ordenar.querySelector(".ordenar-selected")?.id;
}

// element.classList.toggle('is-hidden',!isShow)


function main(){
    showProductos();
    inicializar();
    mostrar_cantidad_productos();
    

    btn_buscar.onclick = async function(){
        // console.log("HOLA");
        let data = await fetchData(URL_DATA);
        let buscar_p = document.getElementById("input_buscar"); 
        data = buscarProducto(data,buscar_p.value);
        buscar_p.value="";
        limpiarHTML(contenedor_productos);
        // console.log(data);
        renderizarProductos(data);
    };
    filtros.onclick = async function(event){
        funcionFiltrar(event);
    };
    contenedor_ordenar.onclick = async function(event){
        let tipo = event.target.id;
        removerClass(contenedor_ordenar,'dropdown-item',"ordenar-selected");
        event.target.classList.add("ordenar-selected");
        renderizarProductos( realizarFiltros(await ordenar(tipo)));

    };

    INICIO.onclick = function(){
        removerClass(contenedor_ordenar,'dropdown-item',"ordenar-selected");
        showProductos();
    };

    btn_cerrar_producto.onclick = function(){
        ocultarModal(modal_producto);
    };

    shop_cart.onclick = function(){
        showCarrito();
    };

    btn_vaciar_cart.onclick = function(){
        vaciar_cart();
    };
    btn_finalizar.onclick = function(){
        finalizar_cart();
    };

   
    btn_agregar_carrito.addEventListener("click",async()=>{
        agregarCarrito(); 
        ocultarModal(modal_producto);
    });

    btn_menos.onclick = function(){
        
        if ((Number(cantidad.value))>1){
            cantidad.value=Number(cantidad.value)-1;
            
        }  
               
    }
    btn_mas.onclick = function(){
        if (Number(cantidad.value)<20){
            cantidad.value=Number(cantidad.value)+1;
        }
                
    }
    cantidad.onchange = function(){
        if (Number(cantidad.value)>20){
            cantidad.value=20;
        }
        if (Number(cantidad.value)<1){
            cantidad.value=1;
        }
                
    }

}


function limpiarHTML(contenedor){
    while(contenedor.firstChild){
        contenedor.removeChild(contenedor.firstChild);
    }
}

async function llenarModalProducto(id, brand, name, price, api_featured_image, description, rating, category){
    const img = contenedor_modal_producto.querySelector(".card-img");
    const title = contenedor_modal_producto.querySelector(".card-title");
    const subtitle = contenedor_modal_producto.querySelector(".card-subtitle");
    const categoria = contenedor_modal_producto.querySelector(".card-category");
    const descripcion = contenedor_modal_producto.querySelector(".card-description");
    const precio = contenedor_modal_producto.querySelector(".card-price");
    const stars = contenedor_modal_producto.querySelector(".card-rating");
    
    contenedor_modal_producto.id = id;
    
    img.innerHTML = `<img src="https:${api_featured_image}" class="img-thumbnail" alt="${name} ${brand?brand:""}">`;
    title.innerHTML = brand.toUpperCase()??"";
    subtitle.innerHTML = name;
    categoria.innerHTML = `<strong>Categoria:</strong> ${category}`;
    descripcion.innerHTML = `<strong>Descripcion:</strong> ${description}`;
    precio.innerHTML = `$ ${Number(price).toFixed(2)}`;
    stars.innerHTML = starRating(rating);
}


async function agregarCarrito(){
    let data = await fetchData(URL_DATA);
    if(data){
        const {id, brand, name, price, api_featured_image, description, rating,
        category} = data.filter(producto=>producto.id===Number(contenedor_modal_producto.id))[0];
        addCarrito(new Producto(id, brand, name, price, api_featured_image, description, rating,
            category, cantidad.value));
        cantidad.value = 1;
        mensajeSweetAlert(SUCCESS,"Agregado",MSJ_ADD_CART);
        mostrar_cantidad_productos();
    }
    else{
        mensajeSweetAlert(ERROR,"Error",MSJ_ERROR);
    }
    
    
}

function mensajeSweetAlert(icon,title, mensaje){
    Swal.fire({
        icon: icon,
        title: title,
        text: mensaje,
        showConfirmButton: false,
        timer: 2000
    });
}

function confirmarSweetAlert(text,title,msj,action,id=null){
    Swal.fire({
        text: text,
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",        
        // confirmButtonColor: "#3085d6",
        confirmButtonText: "Si"
    }).then((result) => {
        if (result.isConfirmed) {
            if(id){
                action(id)?mensajeSweetAlert(SUCCESS,title,msj):mensajeSweetAlert(ERROR,"ERROR","Error al eliminar el producto");
            }
            else{
                action();
                mensajeSweetAlert(SUCCESS,title,msj)
            }
            
            showCarrito();
            showProductos();
        }
    });
}


function recorrerProductos(productos){

}

async function showProductos(){
    limpiarHTML(contenedor_productos);
    let productos = await fetchData(URL_DATA);
    inicializarFiltros("categoria",categorias);
    inicializarFiltros("marcas",marcas);
    renderizarProductos(productos);
}

function renderizarProductos(productos){
    if(!productos){
        ocultarModal(document.querySelector(".title"));
        ocultarModal(document.querySelector(".filters"));
        contenedor_productos.classList.remove("row", "row-cols-1", "row-cols-md-3", "row-cols-lg-4");
        divErrorAPI();
        return;
    }
    if(productos.length===0){
        ocultarModal(document.querySelector(".title"));
        contenedor_productos.classList.remove("row", "row-cols-1", "row-cols-md-3", "row-cols-lg-4");
        divProductoNoEncontrado();
        return;
    }
    // console.log(productos);
    showModal(document.querySelector(".filters"));
    contenedor_productos.classList.add("row", "row-cols-1", "row-cols-md-3", "row-cols-lg-4")
    productos.forEach(producto=>{
        const {id, brand, name, price, api_featured_image, description, rating,
        category} = producto;
        let card_producto = document.createElement("div");
        card_producto.classList.add("col");
        // card_producto.style = "width: 18rem;";
        const text_boton = "Agregar al carrito";
        const class_btn = "btn btn-primary";
        card_producto.innerHTML = `
            <div data-marca="${brand}" data-categoria="${category}" class="card h-100 card_producto" id="card_${id}">
            <div class="card-img">
                <img src="https:${api_featured_image}" class="img-thumbnail" alt="${name}">
            </div>
            
            <div class="card-body">
                ${brand?`<h5 class="card-title">${brand.toUpperCase()}</h5>`:""}
                <h6 class="card-subtitle">${name}</h6>
                <div class ="row">
                    <div class = "col-6">
                        <p class="card-text card-price">$ ${Number(price).toFixed(2)}</p>
                    </div>
                    <div class = "col-6 left">
                        <p class="card-text card-rating">${rating?starRating(rating):""}</p>
                    </div>
                </div>
            </div>
            </div>
            
        `;
        contenedor_productos.appendChild(card_producto);

        const detalle_producto = document.getElementById(`card_${id}`);
        detalle_producto.addEventListener("click",()=>{
            showModal(modal_producto);
            llenarModalProducto(id, brand, name, price, api_featured_image, description, rating, category);
        });
    });

}

function showModal(modal,mode="block"){
    modal.style.display = mode;
}

function ocultarModal(modal){
    modal.style.display = 'none';
    
}

function divCarritoVacio(){
    contenedor_carrito.innerHTML = `
        <div class = "container carrito-vacio">
            <h5>Tu carrito esta vacio</h5>
            <button type="button" data-bs-dismiss="offcanvas" class="btn btn-primary" id="comenzar_comprar">Comenzar a comprar</button>
        </div>
    `
    document.querySelector('#comenzar_comprar').onclick = function(){
        showProductos();
    };
}

function divErrorAPI(){
    contenedor_productos.innerHTML = `
        <div class="error-datos">
            <i class="fa-solid fa-bug fa-2xl"></i>
            <h5>Problemas tecnicos</h5>
            <h6>Intente mas tarde</h6>
        </div>
    `
}
function divProductoNoEncontrado(){
    contenedor_productos.innerHTML = `
        <div class="no-encontrado">
            <div>
                <i class="fa-solid fa-circle-exclamation fa-2xl"></i>
            </div>
            <div>
                <h2>No se ha encontrado el producto</h2>
            </div>

            
            
        </div>
    `
}
function showCarrito(){
    limpiarHTML(contenedor_carrito);
    if(emptyCarrito()){
        ocultarModal(total_carrito);
        divCarritoVacio();
    }
    else{
        showModal(total_carrito);
        carrito.forEach(producto=>{
            const {id, brand, name, price, image, cantidad, subtotal} = producto;
            let card_producto = document.createElement("div");
            
            card_producto.innerHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-4">
                            <img src="https:${image}" class="img-fluid rounded-start" alt="${name}_${brand??""}">
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h5 class="card-title">${brand.toUpperCase()??""}</h5>
                                <h6 class="card-subtitle">${name}</h5>
                                <hr>
                                <div class = "row cols-2">
                                    <div class="col right">
                                        <p class="card-text">Precio:</p>
                                    </div>
                                    <div class="col left">
                                        <p class="card-text">$${price}</p>
                                    </div>
                                </div>
                                <div class = "row cols-2">
                                    <div class="col right">
                                        <p class="card-text">Cantidad:</p>
                                    </div>
                                    <div class="col left">
                                        <p class="card-text">${cantidad}</p>
                                    </div>
                                </div>
                                <div class = "row cols-2">
                                    <div class="col right">
                                        <p class="card-text">Subtotal:</p>
                                    </div>
                                    <div class="col left">
                                        <p class="card-text">$${subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div class="left eliminar">
                                    <button id="${id}" class="btn btn-primary eliminar-producto"><i class="fa-solid fa-trash fa-xs"></i></button>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            `;

            contenedor_carrito.appendChild(card_producto);
            const boton_eliminar = document.getElementById(`${id}`)

            boton_eliminar.addEventListener("click", ()=>{
                const text = "Desea eliminar el producto del carrito?";
                const title = "ELIMINADO";
                const msj = "Se ha eliminado el producto del carrito"
                confirmarSweetAlert(text,title, msj,eliminarProducto,id);
            })

        });
        
        
    }
    mostrar_cantidad_productos();
    calcular_total();
    // showModal(modal_carrito);




}



function mostrar_cantidad_productos(){
    if(!emptyCarrito()){
        showModal(shop_cart,"flex");
        // shop_cart.style.display ="flex";
        showModal(total_art);
        // total_art.style.display='block';
        total_art.innerHTML = `${articulosCarrito()}`;

    }
    else{
        showModal(shop_cart);
        // shop_cart.style.display ="block";
        ocultarModal(total_art);
        // total_art.style.display='none';
    }
}

function calcular_total(){
    total_num.innerHTML = `$ ${totalCarrito().toFixed(2)}`;
}

function eliminar_del_carrito(id){
    const eliminado=Carrito.eliminar_del_carrito(id);
    console.log(eliminado);
    ProductosTienda.actualizar_productos(eliminado,"regresar_stock");    

}

function finalizar_cart(){
    const text = "Desea finalizar la compra?";
    const title = "DISFRUTE DE SU COMPRA";
    const msj = "Se ha finalizado la compra"
    confirmarSweetAlert(text,title, msj, finalizarCarrito);
}

function vaciar_cart(){
    const text = "Desea vaciar el carrito?";
    const title = "VACIADO";
    const msj = "Se ha vaciado el carrito"
    confirmarSweetAlert(text,title, msj,vaciarCarrito);
    
}


// Obtener los datos desde una API
async function fetchData(URL) {
    try {
        let response = await fetch(URL);
        if(!response.ok){
            throw new Error(`Error en la peticion: ${response.status} ${response.statusText}`);
        }
        let data = await response.json();
        categorias=[];
        marcas=[];
        data.forEach(producto=>{
            
            if(!categorias.includes(producto.category) && producto.category){
                // console.log(producto.category);
                categorias.push(producto.category)
            }
            if(!marcas.includes(producto.brand) && producto.brand){
                marcas.push(producto.brand)
            }
        }) 
        return data;
    } catch (error) {
        console.error(error);
    }
}



// test('debería lanzar un error al dividir por cero', () => {
//     expect(() => dividir(10, 0)).toThrow("No se puede dividir por cero.");
// });


function starRating(rating){
    if(rating){
        let decimal = (rating*10)%10;
        let fullStars = Math.trunc(rating) + ((decimal>7)?1:0);
        let halfStar = (4<=decimal && decimal<=7)?1:0;
        let emptyStars = STAR_RATING - fullStars - halfStar;

        // let stars = document.createElement("div");
        // stars.classList.add("star_rating");
        let stars = `${rating.toFixed(1)} `;
        for(let i=0;i<fullStars;i++){
            stars+=`<i class="fa-solid fa-star fa-2xs"></i>`;
        }
        if(halfStar===1){
            stars+=`<i class="fa-solid fa-star-half-stroke fa-2xs""></i>`;
        }
        for(let i=0;i<emptyStars;i++){
            stars+=`<i class="fa-regular fa-star fa-2xs""></i>`;
        }

        return stars;
    }
    else{
        return null;
    }
    
    
}



// fetchData()
main();