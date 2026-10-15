import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type AccountRole = { #seller; #buyer };

  type UserProfile = {
    id : Principal;
    displayName : Text;
    bio : Text;
    contactEmail : Text;
    roles : [AccountRole];
    createdAt : Int;
    updatedAt : Int;
  };

  type Field = {
    #business;
    #agriculture;
    #medicine;
    #mechanicalEngineering;
    #bio;
    #technology;
    #education;
    #energy;
    #other;
  };

  type Stage = { #concept; #prototype; #readyToLaunch };
  type IdeaStatus = { #draft; #published };

  type IdeaDocument = {
    id : Nat;
    name : Text;
    url : Text;
    contentType : Text;
    uploadedAt : Int;
  };

  type Idea = {
    id : Nat;
    owner : Principal;
    title : Text;
    summary : Text;
    description : Text;
    field : Field;
    businessPlan : Text;
    fundingTarget : ?Nat;
    stage : Stage;
    location : Text;
    status : IdeaStatus;
    documents : [IdeaDocument];
    images : [IdeaDocument];
    viewCount : Nat;
    interestCount : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  type Interest = {
    id : Nat;
    ideaId : Nat;
    buyer : Principal;
    message : Text;
    createdAt : Int;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    profiles : Map.Map<Principal, UserProfile>;
    ideas : Map.Map<Nat, Idea>;
    interests : Map.Map<Nat, Interest>;
    nextIdeaId : { var value : Nat };
    nextInterestId : { var value : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      profiles = Map.empty();
      ideas = Map.empty();
      interests = Map.empty();
      nextIdeaId = { var value = 0 };
      nextInterestId = { var value = 0 };
    };
  };
};
