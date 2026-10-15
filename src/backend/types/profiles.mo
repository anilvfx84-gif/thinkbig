import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type AccountRole = {
    #seller;
    #buyer;
  };

  public type UserProfile = {
    id : UserId;
    displayName : Text;
    bio : Text;
    contactEmail : Text;
    roles : [AccountRole];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
};
