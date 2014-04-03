//Fichier de javascript
app = (function(){

	function app_module_log() {
	  el = document.getElementById("overlay");
	  el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
		join();
	}

	function app_nouveau_restaurateur(){
		app_admin_hide();
		$('#add-restaurateur').show();
	}

	function app_nouveau_restaurant(){
		app_admin_hide();
		$('#add-restaurant').show();
	}

	function app_nouveau_livreur(){
		app_admin_hide();
		$('#add-livreur').show();
	}
		function app_gerer_restaurateur(){
		app_admin_hide();
		$('#gerer-restaurateur').show();
	}

	function app_gerer_restaurant(){
		app_admin_hide();
		$('#gerer-restaurant').show();
	}

	function app_gerer_livreur(){
		app_admin_hide();
		$('#gerer-livreur').show();
	}

	function app_admin_hide(){
		$('#add-restaurateur').hide();
		$('#add-restaurant').hide();
		$('#add-livreur').hide();
		$('#gerer-restaurateur').hide();
		$('#gerer-restaurant').hide();
		$('#gerer-livreur').hide();
	}

	function app_add_menu(){
		app_menus_hide();
		$('#add-menu').show();
	}

	function app_menus(){
		app_menus_hide();
		$('#menus').show();
	}

	function app_menu_preparation(){
		app_menus_hide();
		$('#menu-preparation').show();
	}

	function app_menus_hide(){
		$('#add-menu').hide();
		$('#menus').hide();
		$('#menu-preparation').hide();
	}

  var general=(function(){ 
  	var cart = null;
  	var complete = false;
  	var addrId=-1;
    function init(){
  		$('.cart').hide(); //temp
  		$('.shoopingCart').hide();
  		$('#complete_sucess').hide();
    }

    function redirect(path){
			window.location.href =  path;
		}

		function app_open(){
			$('.register-app').hide();
			$("#oauth-error").hide();
			$('#register-error').hide();
		}

		function app_signin () {
			$('.login-app').show();
			$('.register-app').hide();
		}

		function app_register () {
			$('.login-app').hide();
			$('.register-app').show();
		}
		function app_restaurants(){
			$.ajax({
			    type: "GET",
			    url: "/api/listRestaurants",
			    dataType: "html",
			    success: function(result){
			    	$.each($.parseJSON(result), function(idx, obj) {
			    		$('#lstRestaurants').append('<li><a href="javascript:app.general.getFoodElements('+obj.id+')" id="'+obj.id+'">'+obj.nom+'</a></li>');
					});
			    }        
			});
		}

		function getFoodElements(id){
			  app.general.menu(id);
              app.general.plats(id);
		}

		function menu(id){
			$.ajax({
				type: "GET",
				data:{
					id:id,
				},
				url: "/api/restaurant_menu",
				dataType: "html",
				success: function(result){
					menu = $.parseJSON(result)
					$('#resto-menu').text(menu.nom);
				}        
          	});
		}

		function plats(id){
			$.ajax({
				type: "GET",
				data:{
					menu_id:id,
				},
				url: "/api/menu_plats",
				dataType: "html",
				success: function(result){
					$.each($.parseJSON(result), function(idx, obj) {
						$("#ul-plats").append('<li id="'+obj.id+'"><span class="plat-nom">'+obj.nom+'</span><span class="right"><span class="spacing">'+obj.prix+'$</span><a class="c-btn-style" href="javascript:app.general.appCart('+obj.id+')">+</a></span> <br/><span>'+obj.description+'</span></li>');
					});
				}        
          	});
		}

		function plat(id){
	    	$.ajax({
				type: "GET",
				url: "/api/plat",
				data:{
					id: id,
				},
				dataType: "html",
				success: function(result){
					plat = $.parseJSON(result);
					$("#plat-nom").text(plat.nom);
					$("#plat-prix").text(plat.prix + "$");
					$("#plat-description").text(plat.description);
				}        
	      	});
    	}

    	function appCart(id){
    		if (cart == null){
    			cart = new shoopingCart();
    			$.ajax({
					type: "GET",
					url: "/api/plat",
					data:{
						id: id,
					},
					dataType: "html",
					success: function(result){
						plat = $.parseJSON(result);
						cart.pushItem(new shoopingCartItems(id,plat));
					} 
	      		});
    			$('.cart').show();
    		}
    		else{
    			item = cart.find(id);
    			if(item != null){
    				cart.items[item].addQTE();
    			}
    			else{
    				$.ajax({
						type: "GET",
						url: "/api/plat",
						data:{
							id: id,
						},
						dataType: "html",
						success: function(result){
							plat = $.parseJSON(result);
							cart.pushItem(new shoopingCartItems(id,plat));
						} 
	      			});
    			}
    		}
    	}

    	function addQTE(id){
    		 item = cart.find(id);
    		 cart.items[item].addQTE();
    		 $("#qte_"+id).html(cart.items[item].qte);
    		 $('#tr_total').html(cart.total());
    	}

    	function removeQTE(id){
   			item = cart.find(id);
   			cart.items[item].minusQTE();

   			if(cart.items[item].qte==0){
   				$("#tr_"+id).remove();
   				$('#tr_total').html(cart.total());
   				 delete cart.remove(id);
   			}
   			else{
				$("#qte_"+id).html(cart.items[item].qte);
				$('#tr_total').html(cart.total());
   			}


    	}

    	function completeCart(){
    		complete = true;
    		$('#complete_order').show();
    		$('.adresse').hide();
    		$('.adresses').hide();
    		$(".cart-items").html('');
    		$('#complete_sucess').hide();
	    	for (var i = 0; i < cart.items.length; i++) {
	    		obplat = cart.items[i];
				$(".cart-items").append('<tr class="tr" id="tr_'+obplat.id+'"><td>'+obplat.plat.nom+'<span class="right">qte: <span id="qte_'+obplat.id+'">'+obplat.qte+'</span></span></td><td class="bill-price">'+obplat.plat.prix+'$</td><td></td></tr>');
			}
			$(".cart-items").append('<tr class="tr"><td>total</td><td class="bill-price" id="tr_total">'+cart.total()+'$</td><td></td></tr>');

		    var now     = new Date(); 
		    var year    = now.getFullYear();
		    var month   = now.getMonth()+1; 
		    var day     = now.getDate();
		    var hour    = now.getHours();
		    var minute  = now.getMinutes();
		    var second  = now.getSeconds(); 
			$("#liv_date").val(year+'-'+month+'-'+day);
			$("#liv_heure").val(hour+':'+minute+':'+second);
    	}

    	function confirmCart(){
    		var date = $('#liv_date').val();
    		var time = $('#liv_heure').val();
			$.ajax({
				type: "GET",
				url: "/api/confirmer_cart",
				data:{
					date_de_commande: $('#liv_date').val(),
					heure_de_commande: $('#liv_heure').val(),
					prix_total: cart.total(),
					addr_id: addrId,
				},
				dataType: "html",
				success: function(result){
					order = $.parseJSON(result);
					for (var i = 0; i < cart.items.length; i++) {
	    				obplat = cart.items[i];
	    				$.ajax({
							type: "GET",
							url: "/api/confirmer_cart_plat",
							data:{
								commande_id: order.id,
								plat_id: obplat.id,
								qte: obplat.qte,
							},
							dataType: "html",
							success: function(result){
							} 
		  				});
					}
					$('#token').text(order.no_confirmation);
					$('#order_date').text(date);
					$('#order_time').text(time);
					$('#order_total').text(order.prix_total);
					$('#complete_order').hide();
					$('#complete_sucess').show();
					addrId = -1;
					cart = null;
					$('.cart').hide();
				} 
  			});
    	}

    	function showCart(){
    		$('.shoopingCart').show();
    		if(!complete){
    			$('#complete_order').hide();
    		}
    		$(".cart-items").html('');
	    	for (var i = 0; i < cart.items.length; i++) {
	    		obplat = cart.items[i];
				$(".cart-items").append('<tr class="tr" id="tr_'+obplat.id+'"><td>'+obplat.plat.nom+'<span class="right">qte: <span id="qte_'+obplat.id+'">'+obplat.qte+'</span></span></td><td class="bill-price">'+obplat.plat.prix+'$</td><td><a class="c-btn-style" href="javascript:app.general.addQTE('+obplat.id+')">+</a><a class="c-btn-style" href="javascript:app.general.removeQTE('+obplat.id+')">-</a></td></tr>');
			}
			$(".cart-items").append('<tr class="tr"><td>total</td><td class="bill-price" id="tr_total">'+cart.total()+'$</td><td><a class="c-btn-style" href="javascript:app.general.completeCart()">completer</a></td></tr>');

    	}

    	function cartClose(){
    		$('.shoopingCart').hide();
    		$('#complete_sucess').hide();
    		complete = false;
    	}

    	function adresses(){
    		$('.adresses').show();
    		$('.adresse').hide();
    		$("#adresses_list").html('');
    		$.ajax({
				type: "GET",
				url: "/api/adresses",
				dataType: "html",
				success: function(result){
					$.each($.parseJSON(result), function(idx, obj) {
						$("#adresses_list").append('<li id="'+obj.id+'" class="adr-li"><span class="space adr">'+obj.no_maison+'</span><span class="space adr">'+obj.rue+'</span><span class="space adr">'+obj.ville+'</span><span class="space adr">'+obj.code_postal+'</span><br/><span class="space adr">'+obj.telephone+'</span><a href="javascript:app.general.addr('+obj.id+')">select</a></li>');
					});
				} 
			});
    	}

    	function nAdresse(){
    		$('.adresse').show();
    		$('.adresses').hide();
    	}

    	function bAdresse(){
			$.ajax({
				type: "GET",
				url: "/api/nAdresse",
				data:{
					adress:{
			    		no_maison  :  $('#n_adresse_numero').val(), 
			    		rue  :  $('#n_adresse_rue').val(),	
			    		ville  :  $('#n_adresse_ville').val(), 
			    		telephone  :  $('#n_adresse_telephone').val(), 
			    		code_postal  :  $('#n_adresse_code_postale').val()
			    	}
				},
				dataType: "html",
				success: function(result){
					console.log(result);
				} 
			});
    	}

    	function addr(id){
    		addrId = id;
    	}

    return{
      init:init,
      redirect:redirect,
      app_open:app_open,
      app_signin:app_signin,
      app_register:app_register,
      app_restaurants:app_restaurants,
      menu:menu,
      plats:plats,
      getFoodElements:getFoodElements,
      plat:plat,
      appCart:appCart,
      showCart:showCart,
      cartClose:cartClose,
      addQTE:addQTE,
      removeQTE:removeQTE,
      completeCart:completeCart,
      confirmCart:confirmCart,
      adresses:adresses,
      nAdresse:nAdresse,
      bAdresse:bAdresse,
      addr:addr,
    }
  })();

  var users=(function(){ 
    function init(){

    }

    function oauth(){
    	value =  $('#type').find(":selected").val();
			$.ajax({
			    type: "GET",
			    url: "/api/signin",
			    data: {
			    	identificateur : $('#_aka').val(),
			    	mot_de_passe : $('#_password').val(),
			    },
			    dataType: "html",
			    success: function(result){
			        if(result == 1){
			        	general.redirect("/users/profile")
			        }
			        else if(result == 2){
			        	general.redirect("/management/restaurateur")
			        }
			        else if(result == 3){
			        	general.redirect("/management/livraison")
			        }
			        else if(result == 4){
			        	general.redirect("/management/entrepreneur")
			        }
			        else{
			        	$("#oauth-error").show();
			        	$(".message-error").text("mauvais utilisateur ou mot de passe");
			        }
			    }        
			});
		}

		function register () {
			$.ajax({
			    type: "GET",
			    url: "/api/register",
			    data: {
			    	utilisateur: {
				    	nom :  $('#inscription_nom').val(),
				    	prenom :  $('#inscription_prenom').val(),
				    	identificateur : $('#inscription_identificateur').val(),
				    	mot_de_passe : $('#inscription_motDePass').val(),

			    	},
			    	infos:{
			    		courriel : $('#inscription_email').val(),
				    	date_naissance : $('#inscription_dateNaissance').val()
			    	},
			    	adress:{
			    		no_maison  :  $('#adresse_numero').val(), 
			    		rue  :  $('#adresse_rue').val(),	
			    		ville  :  $('#adresse_ville').val(), 
			    		telephone  :  $('#adresse_telephone').val(), 
			    		code_postal  :  $('#adresse_code_postale').val()
			    	}
			    },
			    dataType: "html",
			    success: function(result){
			        if(result==1){
			        	general.redirect("/users/profile")
			        }
			        else{
						$('#register-error').show();
						$('.register-message-error').text("oups i did it again");
			        }
			    }        
			});
		}

		function user_update(){
			$.ajax({
			    type: "GET",
			    url: "/api/user_update",
			    data: {
			    	mot_de_passe : $('#mdp').val(),
			    	adress:{
			    		no_maison  :  $('#numero').val(), 
			    		rue  :  $('#rue').val(),	
			    		ville  :  $('#ville').val(), 
			    		telephone  :  $('#telephone').val(), 
			    		code_postal  :  $('#code_postale').val()
			    	}
			    },
			    dataType: "html",
			    success: function(result){
			        console.log(result); 
			    }        
			});
		}
	    return{
	      init:init,
	      oauth:oauth,
	      register:register,
	      user_update:user_update,
	    }
  })();

  var entrepreneur=(function(){ 
    function init(){

    }

    function restaurateur_form_values(id, nom, prenom, identificateur, mot_de_passe ) {
		//Cette fonctio place les valeur de la table vers un formulaire pour modifier un restaurateur
		//$('#restaurateur_id_edit').val(id);	//id creer par rails
		$('#restaurateur_nom_edit').val(nom);
	  	$('#restaurateur_prenom_edit').val(prenom);
	  	$('#restaurateur_identificateur_edit').val(identificateur);
	  	$('#restaurateur_mdp_edit').val(mot_de_passe);

	  	//pour modifier l'url de l'action du formulaire
	  	$('#form_modifierRestaurateur').attr('action', '/modifierRestaurateur/'+ id);
	  	//Il faut mettre le _path d'un restaurateur comme varaible pour ne pas devoir harcoder l'url du controller
	}

	function restaurant_form_values(id, nom, no_maison, rue, ville, code_postal, telephone) {
		$('#restaurant_nom_edit').val(nom);
	  	$('#restaurant_no_maison_edit').val(no_maison);
	  	$('#restaurant_rue_edit').val(rue);
	  	$('#restaurant_ville_edit').val(ville);
	  	$('#restaurant_code_postal_edit').val(code_postal);
	  	$('#restaurant_telephone_edit').val(telephone);

	  	//pour modifier l'url de l'action du formulaire
	  	$('#form_modifierRestaurant').attr('action', '/modifierRestaurant/'+ id);
	}

    function livreur_form_values(id, nom, prenom, identificateur, mot_de_passe ) {

		$('#livreur_nom_edit').val(nom);
	  	$('#livreur_prenom_edit').val(prenom);
	  	$('#livreur_identificateur_edit').val(identificateur);
	  	$('#livreur_mdp_edit').val(mot_de_passe);

	  	//pour modifier l'url de l'action du formulaire
	  	$('#form_modifierLivreur').attr('action', '/modifierLivreur/'+ id);
	  	//Il faut mettre le _path d'un restaurateur comme varaible pour ne pas devoir harcoder l'url du controller
	}


    return{
      init:init,
      restaurateur_form_values:restaurateur_form_values,
      restaurant_form_values:restaurant_form_values,
      livreur_form_values:livreur_form_values,
    }
  })();

  var restaurateur=(function(){ 
    function init(){
  		$('#menu-form').hide();
  		$("#cmd").hide();
  		$('#plats-error').hide();
    }

    function getRestaurant(){
          $.ajax({
              type: "GET",
              url: "/api/getRestaurantForRestaurateur",
              dataType: "html",
              success: function(result){
              	 restaurant = $.parseJSON(result)
                if(restaurant != null){
                  $('#resto').text(" " + restaurant.nom);
              	}
              	else{
                  	$('#resto').text(" Aucun restaurant");
              	}
              }        
          });
    }

    function getMenu(){
          $.ajax({
              type: "GET",
              url: "/api/getRetaurantMenu",
              dataType: "html",
              success: function(result){
              	menu = $.parseJSON(result)
                if(menu != null){
                  $('#menu').text(" " + menu.nom);
                  $('.rstoid').attr("id",menu.restaurant_id);
                  getCommandesNotReady();
                  $('#newMenu').hide();
                  $('#menu-form').hide();
                  $('#id-newPlat').show();
                  $('#plats-form').show();
                  $('#nouveau-plat').hide();
                  $('#informations-plat').hide();
                  $('#modifier-plat').hide();
              	}
              	else{
                  	$('#menu').text(" Aucun menu");
                  	$('#plats-form').hide();
                  	$('#id-newPlat').hide();
              	}
              }        
          });
    }

    function bindMenu(){
	 $.ajax({
          type: "GET",
          url: "/api/bindMenu",
          data:{
          	nom: $('#resto_menu').val(),
          },
          dataType: "html",
          success: function(result){
          	menu = $.parseJSON(result);
          	getMenu();
          }        
      });
    }

    function newMenu(){
    	$('#menu-form').show();
    }

    function newPlat(){
    	 $('#nouveau-plat').show();
    }

    function modPlat(id){
    	$('#modifier-plat').show();
    	$.ajax({
			type: "GET",
			url: "/api/plat",
			data:{
				id: id,
			},
			dataType: "html",
			success: function(result){
				plat = $.parseJSON(result);
				$("#plat_mod-nom").val(plat.nom);
				$("#plat_mod-description").val(plat.description);
				$("#plat_mod-prix").val(plat.prix);
				$("#plat_mod-action").attr("href","javascript:app.restaurateur.modifierPlat("+plat.id+")");
			}        
      	});
    }

    function createPlat(){
    	var nom = $('#plat_nom').val();
    	var prix = $('#plat_prix').val();
    	var description = $('#plat_description').val();
    	var error ="";
    	if(nom == ""){
    		error+='le nom du menu est obligatoire<br/>'	
    	}
    	if(description == ""){
    		error+='qu’aucune description n’a été fournie<br/>'
    		$('#plats-error').html('qu’aucune description n’a été fournie');		
    	}
    	if(prix == ""){
    		error+='aucun prix n’a été fournie<br/>'	
    	}

    	if(error!=""){
    		$('#plats-error').html(error);
    		$('#plats-error').show();
    	}
    	else{
    		$('#plats-error').hide();
	   		$.ajax({
	          type: "GET",
	          url: "/api/createPlat",
	          data:{
	          	nom: $('#plat_nom').val(),
	          	prix: $('#plat_prix').val(),
	          	description: $('#plat_description').val(),
	          },
	          dataType: "html",
	          success: function(result){
	          	plat = $.parseJSON(result);
	          	if(plat != 0){
	          		$("#ul-plats").append('<li id="'+plat.id+'"><span class="plat-nom">'+plat.nom+'</span><span class="spacing">'+plat.prix+'$<a class="admin-btn-style" href="javascript:app.restaurateur.modPlat('+plat.id+')">modifier</a></span> </li>');
	          		$('#nouveau-plat').hide();
	          		$('#plat_nom').val("");
	          		$('#plat_prix').val("");
	          		$('#plat_description').val("");
	          	}
	          }        
	     	});
    	}
    }
    function modifierPlat(id){
   		$.ajax({
          type: "GET",
          url: "/api/modPlat",
          data:{
          	id:id,
          	nom: $("#plat_mod-nom").val(),
          	prix: $("#plat_mod-prix").val(),
          	description: $("#plat_mod-description").val(),
          },
          dataType: "html",
          success: function(result){
          	plat = $.parseJSON(result);
          	if(plat != 0){
          		$("#"+plat.id).html('<span class="plat-nom">'+plat.nom+'</span><span class="spacing right">'+plat.prix+'$<a class="admin-btn-style" href="javascript:app.restaurateur.modPlat('+plat.id+')">modifier</a></span>');
          		$("#info-nom-plat").text("");
				$("#info-prix-plat").text("");
				$("#info-description-plat").text("");
				$("#plat_mod-action").attr("href","#");
				$('#informations-plat').hide();
                $('#modifier-plat').hide();
          	}
          }        
     	});
    }

    function getPlats(){
    	$.ajax({
          type: "GET",
          url: "/api/listPlat",
          dataType: "html",
          success: function(result){
			$.each($.parseJSON(result), function(idx, obj) {
				$("#ul-plats").append('<li id="'+obj.id+'"><span class="plat-nom">'+obj.nom+'</span><span class="spacing right">'+obj.prix+'$<a class="admin-btn-style" href="javascript:app.restaurateur.modPlat('+obj.id+')">modifier</a></span><br/><span>'+obj.description+'</span> </li>');
			});

          }        
      	});
    }

    function getCommandesNotReady(){
    	val = $('.rstoid').attr('id');
    	$.ajax({
          type: "GET",
          url: "/api/commandesRestaurantsNotReady",
          dataType: "html",
          data:{
          	restaurant_id:val,
          },
          success: function(result){
			$.each($.parseJSON(result), function(idx, obj) {
				status = "";
				if(!obj.status_pret)
					status = "non pret"

				$(".commandes-items").append('<tr class="tr" id="tr_'+obj.id+'"><td>'+obj.id+'<a class="hunt-btn-style" href="javascript:app.restaurateur.getOrder('+obj.id+')">preparer</a></td><td>'+obj.no_confirmation+'</td><td>'+obj.date_de_commande+'</td><td>'+obj.heure_de_commande+'</td><td id="td_status'+obj.id+'">'+status+'</td></tr>');
			});
          }        
      	});
    }

    function getOrder(id){
    	$.ajax({
          type: "GET",
          url: "/api/commandeOrder",
          data:{
          	id:id
          },
          dataType: "html",
          success: function(result){
          	order = $.parseJSON(result);
          	$('#td_status'+order.id).text("en preparation");
          	$("#cmd-id").text("#"+order.id);
          	$("#cmd-prix").text(order.prix_total+"$"); 
          	$("#cmd-conf").text(order.no_confirmation);
          	getOrderItems(order.id);
          	getAdresse(order.adresse_id);
          	$('#cmd-total').text(order.prix_total+"$");
          	$('#cmd-function').attr('href','javascript:app.restaurateur.ready('+order.id+')');
          	$("#cmd").show();
          }        
      	});
    }

    function getOrderItems(id){
    	$.ajax({
          type: "GET",
          url: "/api/commandeOrderItems",
          data:{
          	commande_id:id
          },
          dataType: "html",
          success: function(result){
          	$('.order-items').html('');
          	$.each($.parseJSON(result), function(idx, obj) {
          		$('.order-items').append('<span class="bill">'+obj.nom+' x '+obj.quantitee+'<span class="bill-price">'+obj.prix+'$</span></span><br/>');
			});
          }        
      	});    	
    }

    function getAdresse(id){
    	$.ajax({
          type: "GET",
          url: "/api/commandeAddr",
          data:{
          	id:id
          },
          dataType: "html",
          success: function(result){
          	addr = $.parseJSON(result);
          	$("#addr_no_maison").text(addr.no_maison);
          	$("#addr_rue").text(addr.rue);
          	$("#addr_ville").text(addr.ville);
          	$("#addr_code_postal").text(addr.code_postal);
          	$("#addr_telephone").text(addr.telephone);
          	}        
      	});    	
    }

    function ready(id){
 		$.ajax({
          type: "GET",
          url: "/api/commandeOrderReady",
          data:{
          	commande_id:id
          },
          dataType: "html",
          success: function(result){
          	cmd = $.parseJSON(result);
          	if(cmd.status_pret){
          		$('#td_status'+order.id).text("pret");
          		$("#cmd").hide();
          	}


          	}        
      	});    	   	
    }

    return{
      init:init,
      getRestaurant:getRestaurant,
      newMenu:newMenu,
      getMenu:getMenu,
      getPlats:getPlats,
      bindMenu:bindMenu,
      newPlat:newPlat,
      modPlat:modPlat,
      createPlat:createPlat,
      modifierPlat:modifierPlat,
      getCommandesNotReady:getCommandesNotReady,
      getOrder:getOrder,
      ready:ready,
    }
  })();

  //return function
  return{
  		general:general,
  		users:users,
  		restaurateur:restaurateur,
	  	entrepreneur:entrepreneur,
	  	
		app_module_log:app_module_log,
		app_admin_hide:app_admin_hide,
		app_nouveau_restaurateur:app_nouveau_restaurateur,
		app_nouveau_restaurant:app_nouveau_restaurant,
		app_nouveau_livreur:app_nouveau_livreur,
		app_gerer_restaurateur:app_gerer_restaurateur,
		app_gerer_restaurant:app_gerer_restaurant,
		app_gerer_livreur:app_gerer_livreur,
		app_menus_hide:app_menus_hide,
		app_add_menu:app_add_menu,
		app_menus:app_menus,
		app_menu_preparation:app_menu_preparation,
	}
})();


function shoopingCart(){
	this.items = new Array();
}
shoopingCart.prototype.pushItem = function(item){
	this.items.push(item);
}
shoopingCart.prototype.find = function(id){
	if(this.items.length>0){
		for (var i = 0; i < this.items.length; i++) {
			if(this.items[i].id == id){
				return i;
			}
		}
	}
	return null;
}
shoopingCart.prototype.remove = function(id){
	if(this.items.length>0){
		for (var i = 0; i < this.items.length; i++) {
			if(this.items[i].id == id){
				this.items.splice(i,1);
			}
		}
	}
}
shoopingCart.prototype.total = function(){
	var total = 0;
	for (var i = 0; i < this.items.length; i++) {
		total+=parseFloat(this.items[i].qte * this.items[i].plat.prix);
	}
	return total;
}

function shoopingCartItems(id,plat){
	this.id = id;
	this.plat = plat;
	this.qte = 1;
}
shoopingCartItems.prototype.addQTE = function(){
	this.qte += 1;
}
shoopingCartItems.prototype.minusQTE = function(){
	this.qte -= 1;
}
function shoopingCartPlat(nom,description,menu_id,prix){
	this.nom = nom;
	this.prix = prix;
	this.menu_id = menu_id;
	this.prix = prix;
}


