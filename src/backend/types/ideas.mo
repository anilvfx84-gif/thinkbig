import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type IdeaId = Common.IdeaId;
  public type DocumentId = Common.DocumentId;

  public type Field = {
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

  public type Stage = {
    #concept;
    #prototype;
    #readyToLaunch;
  };

  public type IdeaStatus = {
    #draft;
    #published;
  };

  public type IdeaDocument = {
    id : DocumentId;
    name : Text;
    url : Text;
    contentType : Text;
    uploadedAt : Timestamp;
  };

  public type Idea = {
    id : IdeaId;
    owner : UserId;
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
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type IdeaInput = {
    title : Text;
    summary : Text;
    description : Text;
    field : Field;
    businessPlan : Text;
    fundingTarget : ?Nat;
    stage : Stage;
    location : Text;
    documents : [IdeaDocument];
    images : [IdeaDocument];
  };

  public type IdeaFilter = {
    field : ?Field;
    stage : ?Stage;
    minFunding : ?Nat;
    maxFunding : ?Nat;
    search : ?Text;
    sort : ?IdeaSort;
  };

  public type IdeaSort = {
    #newest;
    #mostViewed;
  };
};
