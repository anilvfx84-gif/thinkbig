import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import ProfilesApi "mixins/profiles-api";
import IdeasApi "mixins/ideas-api";
import InterestsApi "mixins/interests-api";
import ApiDocMixin "mixins/api-doc";
import ProfileTypes "types/profiles";
import IdeaTypes "types/ideas";
import InterestTypes "types/interests";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let profiles : Map.Map<Principal, ProfileTypes.UserProfile>;
  let ideas : Map.Map<Nat, IdeaTypes.Idea>;
  let interests : Map.Map<Nat, InterestTypes.Interest>;
  let nextIdeaId : { var value : Nat };
  let nextInterestId : { var value : Nat };

  include ProfilesApi(accessControlState, profiles);
  include IdeasApi(accessControlState, ideas, nextIdeaId);
  include InterestsApi(accessControlState, interests, nextInterestId, ideas);

  transient let anyPrincipal = Principal.fromText("aaaaa-aa");

  func roleToText(role : ProfileTypes.AccountRole) : Text =
    switch role {
      case (#seller) "seller";
      case (#buyer) "buyer";
    };

  func fieldToText(field : IdeaTypes.Field) : Text =
    switch field {
      case (#business) "business";
      case (#agriculture) "agriculture";
      case (#medicine) "medicine";
      case (#mechanicalEngineering) "mechanicalEngineering";
      case (#bio) "bio";
      case (#technology) "technology";
      case (#education) "education";
      case (#energy) "energy";
      case (#other) "other";
    };

  func stageToText(stage : IdeaTypes.Stage) : Text =
    switch stage {
      case (#concept) "concept";
      case (#prototype) "prototype";
      case (#readyToLaunch) "readyToLaunch";
    };

  func statusToText(status : IdeaTypes.IdeaStatus) : Text =
    switch status {
      case (#draft) "draft";
      case (#published) "published";
    };

  include Expose({
    entities = [
      profiles.toEntityManual("profile", "UserProfile", "id")
        .sample({
          id = anyPrincipal;
          displayName = "";
          bio = "";
          contactEmail = "";
          roles = [];
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func p = p.id)
        .payload("displayName", func p = p.displayName)
        .payload("bio", func p = p.bio)
        .payload("contactEmail", func p = p.contactEmail)
        .payload("roles", func p = p.roles.map(func r = roleToText(r)).values().join(","))
        .payload("createdAt", func p = p.createdAt)
        .payload("updatedAt", func p = p.updatedAt)
        .controllerOnly()
        .build(),
      ideas.toEntityManual("idea", "Idea", "id")
        .sample({
          id = 0;
          owner = anyPrincipal;
          title = "";
          summary = "";
          description = "";
          field = #other;
          businessPlan = "";
          fundingTarget = null;
          stage = #concept;
          location = "";
          status = #draft;
          documents = [];
          images = [];
          viewCount = 0;
          interestCount = 0;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func i = i.id)
        .payload("owner", func i = i.owner)
        .payload("title", func i = i.title)
        .payload("summary", func i = i.summary)
        .payload("description", func i = i.description)
        .payload("field", func i = fieldToText(i.field))
        .payload("businessPlan", func i = i.businessPlan)
        .payload("fundingTarget", func i = i.fundingTarget ?? 0)
        .payload("stage", func i = stageToText(i.stage))
        .payload("location", func i = i.location)
        .payload("status", func i = statusToText(i.status))
        .payload("documentCount", func i = i.documents.size())
        .payload("imageCount", func i = i.images.size())
        .payload("viewCount", func i = i.viewCount)
        .payload("interestCount", func i = i.interestCount)
        .payload("createdAt", func i = i.createdAt)
        .payload("updatedAt", func i = i.updatedAt)
        .edge("owner", "profile")
        .controllerOnly()
        .build(),
      interests.toEntity("interest", "Interest", "id")
        .sample({
          id = 0;
          ideaId = 0;
          buyer = anyPrincipal;
          message = "";
          createdAt = 0;
        })
        .edge("ideaId", "idea")
        .edge("buyer", "profile")
        .controllerOnly()
        .build(),
    ];
  });

  include ApiDocMixin();
};
