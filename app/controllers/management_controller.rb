class ManagementController < ApplicationController
  skip_before_filter :verify_authenticity_token
  layout 'application'
  include API

    def entrepreneur  
      @restaurateur = Restaurateur.all #left join fait a l'interne grace aux has_one dans les modeles
      @restaurateurs_sans_restaurants = Restaurateur.includes(:restaurant).where(restaurants: {restaurateur_id: nil})
      @nouveau_restaurateur = Restaurateur.new
      @restaurants = Restaurant.where(restaurateur_id: nil) #on veut les restaurants qui n'ont pas de restaurateur d'assigne
      @nouveau_restaurant = Restaurant.new
      @restaurants_restaurateurs = Restaurant.all
      @nouveau_livreur = Livreur.new
      @livreurs = Livreur.all
      @_user = current_client
    end

    def restaurateur
        @_user = current_client
    end

    #fonction pour ajouter un restaurateur
  def saisirInformations
        restaurateur = Restaurateur.new(utilisateur_params)
        #Utilisattion des fonctions prédéfinis de rails
        #Pas de nécessité de créer Restaurateur.setInfo comme dans le RDCU1 
      respond_to do |format|
        if restaurateur.save
          if params[:restaurant] != "-1"  #un restaurant a ete selectionne
            restaurant = Restaurant.find(params[:restaurant])
            restaurant.update(restaurateur_id: restaurateur.id)
            
            format.json { render :json => { :response => "1", :restaurateur => restaurateur, :restaurant_nom => restaurant.nom, :restaurant_adresse => restaurant.adresse } }
          else
            format.json { render :json => { :response => "2", :restaurateur => restaurateur} } #restaurateur créé sans restaurant
          end         
        else
            format.json { render :json => { :response => "0", :errors => restaurateur.errors } }
        end 
      end
        
  end

    def supprimerRestaurateur

        res = Restaurateur.find(params[:id])
        respond_to do |format|
          if res.destroy
            format.json { render :json => { :response => "1"} }
          else
            format.json { render :json => { :response => "0"} }
          end
        end
    end

  def modifierRestaurateur
      restaurateur = Restaurateur.find(params[:id])
      respond_to do |format|
        if restaurateur.update_attributes(utilisateur_params)

          #modification des parametres du restaurateur
          if params[:restaurant] != "-1" 
              restaurant_modification = Restaurant.find(params[:restaurant])
              restaurateur.restaurant.update(restaurateur_id: nil) unless restaurateur.restaurant.nil?
              restaurant_modification.update(restaurateur_id: restaurateur.id)

            format.json { render :json => { :response => "1", :restaurateur => restaurateur, :restaurant_nom => "#{restaurant_modification.nom} #{restaurant_modification.prenom}", :restaurant_adresse => restaurant_modification.adresse } }
          else
            format.json { render :json => { :response => "2", :restaurateur => restaurateur} }
          end         
        
        else
            format.json { render :json => { :response => "0", :errors => restaurateur.errors } }
        end 
      end
  end

  #fonction pour ajouter un restaurateur
  def saisirInformationsLivreur
      livreur = Livreur.new(utilisateur_params)
      #Utilisattion des fonctions prédéfinis de rails
      #Pas de nécessité de créer Restaurateur.setInfo comme dans le RDCU1 
    respond_to do |format|
      if livreur.save
          format.json { render :json => { :response => "1", :livreur => livreur } }
      else
          format.json { render :json => { :response => "0", :errors => livreur.errors } }
      end
    end 
  end

  def supprimerLivreur
    livreur = Livreur.find(params[:id])
    respond_to do |format|
      if livreur.destroy
        format.json { render :json => { :response => "1"} }
      else
        format.json { render :json => { :response => "0"} }
      end
    end 
  end

  def modifierLivreur
    livreur = Livreur.find(params[:id])
    respond_to do |format|
      if livreur.update_attributes(utilisateur_params)
          format.json { render :json => { :response => "1", :livreur => livreur } }
      else
          format.json { render :json => { :response => "0", :errors => livreur.errors } }
      end
    end
  end

  #---------------------Section pour le restaurant-----------------------
  #fonction pour ajouter un restaurant
  def saisirInformationsRestaurant
       nouveau_restaurant = Restaurant.new(restaurant_params)
       restaurant_adresse = nouveau_restaurant.build_adresse(adresse_params)    #va creer une adresse avec la cle etrangere de restaurant
       restaurant_adresse.principale = true

        #Utilisattion des fonctions prédéfinis de rails
        #Pas de nécessité de créer Restaurateur.setInfo comme dans le RDCU1
      respond_to do |format|
        if nouveau_restaurant.save
            restaurant_adresse.save
          if params[:restaurateur] != "-1" 
            nouveau_restaurant.update(:restaurateur_id => params[:restaurateur])
            format.json { render :json => { :response => "1", :restaurant => nouveau_restaurant.nom, :adresse => restaurant_adresse, :restaurateur => nouveau_restaurant.restaurateur.nom } }
          else
            format.json { render :json => { :response => "2", :restaurant => nouveau_restaurant.nom, :adresse => restaurant_adresse } }
          end           
        else
          format.json { render :json => { :response => "0", :errors => {:nom => nouveau_restaurant.errors[:nom], :adresse => nouveau_restaurant.adresse.errors } } }
        end
      end
  end

  def supprimerRestaurant
      restaurant = Restaurant.find(params[:id])
      respond_to do |format|
        if restaurant.destroy
          format.json { render :json => { :response => "1"} }
        else
          format.json { render :json => { :response => "0"} }
        end
    end
  end

  def modifierRestaurant
      restaurant = Restaurant.find(params[:id])
      restaurant_adresse = Adresse.find(restaurant.adresse.id)
      respond_to do |format|

          if restaurant.update_attributes(restaurant_params) && restaurant_adresse.update_attributes(adresse_params)     
            if params[:restaurateur] != "-1"
              restaurateur_modification = Restaurateur.find(params[:restaurateur])
              restaurateur_modification.restaurant.update(restaurateur_id: nil) unless restaurateur_modification.restaurant.nil?
              restaurant.update(restaurateur_id: params[:restaurateur])
              nom_complet = "#{restaurateur_modification.prenom} #{restaurateur_modification.nom}"
              format.json { render :json => { :response => "1", :restaurant => restaurant, :adresse => restaurant_adresse, :restaurateur => nom_complet } }
            else
              format.json { render :json => { :response => "2", :restaurant => restaurant, :adresse => restaurant_adresse } }
            end
        else
          format.json { render :json => { :response => "0", :errors => {:nom => restaurant.errors[:nom], :adresse => restaurant_adresse.errors } } }
        end
      end
  end

  #-----------------------------Section du livreur---------------------------
  def livraison   #page principale des livraisons
      @_user = current_client  
      @commandes = Commande.where(status_pret: true, livreur_id: nil).order(heure_de_commande: :asc)   #on récupère toutes les commandes prêtes qui n'ont pas été livrés
  end

  def livraisonDetails
      commande_actuelle = Commande.find(params[:id])
      adresse_client = Adresse.find(commande_actuelle.adresse_id) #adresse du client
      #requete pour optenir l'adresse du restaurant
      adresse_restaurant = Adresse.find_by_sql "SELECT adresses.no_maison, adresses.rue, adresses.ville, adresses.telephone, adresses.telephone, adresses.code_postal, restaurants.nom FROM adresses 
                                                INNER JOIN restaurants ON adresses.adresseable_id = restaurants.id 
                                                INNER JOIN menus ON restaurants.id = menus.restaurant_id 
                                                INNER JOIN plats ON menus.id = plats.menu_id 
                                                INNER JOIN commandes_plats ON plats.id = commandes_plats.plat_id 
                                                AND commandes_plats.commande_id = '#{commande_actuelle.id}' 
                                                AND adresses.adresseable_type = 'Restaurant'
                                                LIMIT 1
                                                "
      if !adresse_client.nil? && !adresse_restaurant.nil?
        respond_to do |format|
          format.html 
          format.json { render :json => { :response => "1", :adresse_client => adresse_client, :adresse_restaurant => adresse_restaurant } }
        end
      else
        format.json { render :json => { :response => "0", :errors => 'Impossible de récupérer les adresses'} }
      end
  end

  def livrerCommande
      user = current_client
      d = Date.today.to_formatted_s(:rfc822)  #2014-03-22 exemple
      t = Time.now.strftime("%I:%M%p") #formatage de l'heure actuelle exemple 04:22PM
      livraison = Livraison.new(:commande_id => params[:id],:date_de_livraison => d, :heure_de_livraison => t)
      commande = Commande.find(params[:id])
      client = Client.find(commande.client_id)
      respond_to do |format|
        if livraison.save
            commande.livreur_id = user.id     #param session requis
            commande.save
            Notifier.notifier_client(client, commande).deliver
            format.json { render :json => { :response => "1" } }
        else
            format.json { render :json => { :response => "0" } }
        end
      end
  end

  #obtention des permissions sur les parametres
  def restaurant_params
      params.require(:restaurant).permit! #facon courte de tout permettre
  end

  def adresse_params
      params.require(:adresse).permit!
  end

  def utilisateur_params
      params.require(:utilisateur).permit(:identificateur, :mot_de_passe, :nom, :prenom)
  end

end
