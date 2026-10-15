import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type IdeaId = Common.IdeaId;
  public type InterestId = Common.InterestId;

  public type Interest = {
    id : InterestId;
    ideaId : IdeaId;
    buyer : UserId;
    message : Text;
    createdAt : Timestamp;
  };
};
